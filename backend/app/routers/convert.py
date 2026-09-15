"""FastAPI router for server-side heavy conversion tasks."""
import io
import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import Response
import pandas as pd

router = APIRouter(prefix="/convert", tags=["conversions"])


@router.post("/pdf-to-excel", summary="Extract tables from PDF into Excel (.xlsx)")
async def convert_pdf_to_excel(
    file: UploadFile = File(..., description="PDF file to extract tables from"),
    sheet_name: Optional[str] = Form("Sheet1", description="Target Excel sheet name"),
):
    """
    Extracts structured tables from PDF files (e.g. bank statements, invoices)
    using pdfplumber and compiles them into a clean Excel spreadsheet.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a .pdf extension",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded PDF file is empty",
        )

    try:
        import pdfplumber

        all_rows = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        # Clean cell values
                        cleaned_row = [
                            cell.strip() if isinstance(cell, str) else cell
                            for cell in row
                        ]
                        all_rows.append(cleaned_row)

        if not all_rows:
            # Fallback if no explicit grid tables were detected: extract text lines
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        for line in text.split("\n"):
                            if line.strip():
                                all_rows.append([line.strip()])

        if not all_rows:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract any tabular data from the provided PDF",
            )

        # Build DataFrame
        header = all_rows[0]
        data = all_rows[1:] if len(all_rows) > 1 else []
        df = pd.DataFrame(data, columns=header)

        output_buffer = io.BytesIO()
        with pd.ExcelWriter(output_buffer, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name=sheet_name or "Sheet1", index=False)

        output_buffer.seek(0)
        output_filename = file.filename.rsplit(".", 1)[0] + ".xlsx"

        return Response(
            content=output_buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{output_filename}"',
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF table extraction: {str(e)}",
        )


@router.post("/xml-heavy-to-excel", summary="Convert massive XML feeds into Excel")
async def convert_xml_heavy_to_excel(
    file: UploadFile = File(..., description="Large XML file (>10MB)"),
    sheet_name: Optional[str] = Form("Sheet1"),
):
    """
    Parses massive XML feeds and ERP exports using xmltodict and pandas,
    streaming back an Excel spreadsheet.
    """
    if not file.filename or not file.filename.lower().endswith(".xml"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a .xml extension",
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded XML file is empty",
        )

    try:
        import xmltodict

        data_dict = xmltodict.parse(content)
        # Flatten dictionary to table using pandas json_normalize
        df = pd.json_normalize(data_dict)

        output_buffer = io.BytesIO()
        with pd.ExcelWriter(output_buffer, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name=sheet_name or "Sheet1", index=False)

        output_buffer.seek(0)
        output_filename = file.filename.rsplit(".", 1)[0] + ".xlsx"

        return Response(
            content=output_buffer.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f'attachment; filename="{output_filename}"',
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process XML file: {str(e)}",
        )
