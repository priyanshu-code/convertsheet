import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Base64Tool } from "../Base64Tool";
import { JsonFormatterTool } from "../JsonFormatterTool";
import { UrlEncoderTool } from "../UrlEncoderTool";
import { HashGeneratorTool } from "../HashGeneratorTool";
import { UnixTimestampTool } from "../UnixTimestampTool";
import { ColorCodeTool } from "../ColorCodeTool";

describe("Data & Developer Tools Suite", () => {
  it("Base64Tool encodes and decodes UTF-8 strings correctly", () => {
    render(<Base64Tool />);
    expect(screen.getByText("Base64 Encoder & Decoder")).toBeInTheDocument();

    const textarea = screen.getByLabelText(/Plain Text Input/i);
    fireEvent.change(textarea, { target: { value: "Hello" } });

    // Base64 of "Hello" is "SGVsbG8="
    expect(screen.getByText("SGVsbG8=")).toBeInTheDocument();
  });

  it("JsonFormatterTool validates and formats valid JSON and shows error for invalid JSON", () => {
    render(<JsonFormatterTool />);
    expect(screen.getByText("JSON Formatter & Validator")).toBeInTheDocument();

    const textarea = screen.getByLabelText(/JSON Editor/i);
    fireEvent.change(textarea, { target: { value: '{"a": 1, "b": 2}' } });
    expect(screen.getByText("Formatted Output (Valid JSON)")).toBeInTheDocument();

    // Invalid JSON
    fireEvent.change(textarea, { target: { value: '{invalid: true' } });
    expect(screen.getAllByText(/Syntax Error/i)[0]).toBeInTheDocument();
  });

  it("UrlEncoderTool encodes and decodes URI strings", () => {
    render(<UrlEncoderTool />);
    expect(screen.getByText("URL Encoder & Decoder")).toBeInTheDocument();

    const textarea = screen.getByLabelText(/Raw URL/i);
    fireEvent.change(textarea, { target: { value: "hello world&foo=bar" } });
    expect(screen.getByText("hello%20world%26foo%3Dbar")).toBeInTheDocument();
  });

  it("HashGeneratorTool renders hashes using Web Crypto", async () => {
    render(<HashGeneratorTool />);
    expect(screen.getByText("Cryptographic Hash Generator")).toBeInTheDocument();
    expect(screen.getByText("SHA-256 Hash (Recommended Standard)")).toBeInTheDocument();
  });

  it("UnixTimestampTool converts epoch seconds to human readable date", () => {
    render(<UnixTimestampTool />);
    expect(screen.getByText("Unix Timestamp Converter")).toBeInTheDocument();

    const input = screen.getByLabelText(/Unix Epoch Timestamp/i);
    fireEvent.change(input, { target: { value: "1700000000" } });
    expect(screen.getByText("Converted Calendar Date")).toBeInTheDocument();
  });

  it("ColorCodeTool converts HEX to RGB and HSL", () => {
    render(<ColorCodeTool />);
    expect(screen.getByText(/Color Code Converter/i)).toBeInTheDocument();

    const input = screen.getByLabelText(/HEX Color Code/i);
    fireEvent.change(input, { target: { value: "FFFFFF" } });
    expect(screen.getByText("rgb(255, 255, 255)")).toBeInTheDocument();
    expect(screen.getByText("hsl(0, 0%, 100%)")).toBeInTheDocument();
  });
});
