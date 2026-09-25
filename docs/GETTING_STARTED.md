# ConvertSheet Contributor & Beginner Guide 🚀

Welcome to **ConvertSheet**! This guide is written for anyone—whether you are a junior developer, designer, marketer, or someone with minimal coding experience—to feel comfortable navigating, editing, and adding features to the project without breaking things.

---

## 1. What is ConvertSheet? (The 30-Second Summary)

ConvertSheet is a high-speed, privacy-first web utility for:
1. **File & Data Converters**: Converting spreadsheets, JSON, CSV, XML, PDF tables, etc., directly inside the user's browser (0 server cost, 100% private).
2. **Financial & Everyday Calculators**: Quick tools for mortgages, loan EMIs, salary take-home (US, UK, Canada, Australia, India), SIP investments, tip splitting, discounts, BMI, and dates.
3. **Programmatic SEO**: Search-optimized landing pages (e.g. `/convert/json-to-excel` or `/tools/mortgage-calculator/15-year-fixed-5-down`) that load instantly with pre-filled examples.

### How it works under the hood
* **Frontend (`frontend/`)**: Built with **Next.js** (React) and **Tailwind CSS**. Almost 99% of user interactions and calculations happen right here on the user's phone or computer.
* **Backend (`backend/`)**: A **Python FastAPI** service used *only* when files are larger than 10MB or need server-side processing.

---

## 2. Setting Up Your Machine (The 3-Minute Start)

### Prerequisites
You only need two free tools installed on your computer:
1. **Git** (for downloading and saving code)
2. **Node.js** (version 18 or 20+; downloads from [nodejs.org](https://nodejs.org))

### Step-by-Step Commands

Open your Terminal (macOS/Linux) or Command Prompt/PowerShell (Windows), and run:

```bash
# 1. Navigate into the frontend folder
cd convertsheet/frontend

# 2. Install all dependencies (only needed once or when packages change)
npm install

# 3. Start the local development server
npm run dev
```

Now open your browser and visit: **`http://localhost:3000`**  
Any time you edit a file and save it, your browser will automatically refresh with the new changes!

---

## 3. Where is Everything? (Folder Map)

You will spend 95% of your time inside the `frontend/` directory. Here are the folders you need to know:

```text
convertsheet/
├── frontend/
│   ├── src/
│   │   ├── app/                      <-- PAGES & ROUTES (What users see in their URL)
│   │   │   ├── page.tsx              <-- Home page (convertsheet.com)
│   │   │   ├── convert/[slug]/       <-- Converter pages (e.g. /convert/json-to-excel)
│   │   │   ├── tools/[slug]/         <-- Calculator pages (e.g. /tools/emi-calculator)
│   │   │   └── tools/[slug]/[preset]/<-- Pre-configured SEO pages (e.g. /tools/salary-calculator/us-take-home-100k)
│   │   │
│   │   ├── components/               <-- REUSABLE UI BLOCKS
│   │   │   ├── calculator/           <-- Every calculator interface (Emi, Salary, Tip, Discount, etc.)
│   │   │   ├── converter/            <-- File upload zone, paste boxes, result preview table
│   │   │   ├── layout/               <-- Top Navbar, Footer, Cookie banners, Ads
│   │   │   └── seo/                  <-- FAQs, How-To guides, Breadcrumbs
│   │   │
│   │   └── lib/                      <-- DATA & BRAINS (Formulas, text, configurations)
│   │       ├── registry.ts           <-- Master list of all file converters
│   │       ├── tool-registry.ts      <-- Master list of all calculators (metadata, titles, FAQs)
│   │       ├── programmatic-presets.ts<-- Pre-filled values and SEO text for specific scenarios
│   │       └── engines/              <-- Pure math logic (taxes, mortgage math, interest rates)
│   │           └── financial-engine.ts
│   │
│   └── package.json                  <-- Project settings and scripts
```

---

## 4. Step-by-Step Recipes (How to Make Common Changes)

### Recipe A: Editing Text, Titles, or FAQs
* **If it's on a Converter page** (e.g., JSON to Excel):  
  Open `frontend/src/lib/registry.ts`. Find the converter by its slug (`json-to-excel`). You can edit `title`, `metaDescription`, `about`, or the `faqs` list directly.
* **If it's on a Calculator page** (e.g., Tip Calculator):  
  Open `frontend/src/lib/tool-registry.ts`. Search for the tool ID (e.g. `tip-calculator`). You can adjust the FAQs, formula explanations, or intro text.
* **If it's a specific Preset landing page** (e.g., `$100k Salary in US`):  
  Open `frontend/src/lib/programmatic-presets.ts`. Find the preset ID and update the plain text.

---

### Recipe B: Adding or Tweaking Quick-Select Preset Chips on a Calculator
Preset chips let users tap buttons like `$50`, `$100`, or `15%` instead of typing.
1. Open the calculator component in `frontend/src/components/calculator/` (e.g., `DiscountCalculator.tsx`).
2. Look for the preset arrays near the top, such as:
   ```ts
   const DISCOUNT_PRESETS = [10, 20, 25, 30, 40, 50, 70];
   ```
3. Add or change numbers in the array.
4. Save the file and check `http://localhost:3000/tools/discount-calculator` in your browser.

---

### Recipe C: Modifying Colors, Spacing, or Buttons (Tailwind CSS)
ConvertSheet uses **Tailwind CSS** classes directly on HTML elements:
* **Backgrounds & Colors**: `bg-blue-600`, `text-slate-900`, `dark:text-white`
* **Spacing**: `p-4` (padding), `m-2` (margin), `gap-3` (space between items)
* **Rounding & Borders**: `rounded-xl`, `border border-slate-200`
* **Responsive sizing**: `text-sm sm:text-base` (small on mobile, normal on desktop)

**Example**: To make a button rounded with green background:
```tsx
<button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all">
  Calculate
</button>
```

---

### Recipe D: Tweaking or Adding a Math Formula
All mathematical calculations are kept separate from the UI inside `frontend/src/lib/engines/financial-engine.ts`.
1. Open `frontend/src/lib/engines/financial-engine.ts`.
2. Locate the function (e.g., `calculateEmi` or `calculateUkSalary`).
3. Formulas are written in standard JavaScript/TypeScript arithmetic.
4. **Important**: Whenever you edit math formulas, run the test suite to ensure existing numbers still match:
   ```bash
   npm test --prefix frontend
   ```

---

## 5. Golden Rules: How NOT to Break the App 🛡️

1. **Always Guard Numbers Against `NaN`**  
   If a user deletes text from an input box, it becomes an empty string `""`. Never do `Number(val)` alone. Always do:
   ```ts
   const safeValue = Number(rawInput) || 0;
   ```
2. **Never Forget Mobile Screens**  
   Most users visit on mobile phones!
   * Always check how your change looks by resizing your browser or opening DevTools Device Toolbar (`Cmd + Option + I` on Mac or `F12` on Windows).
   * Ensure touch buttons have enough height (`min-h-[36px]` or `min-h-[44px]`).
   * Never cause horizontal scrolling (avoid fixed wide widths like `w-[800px]`, use `w-full max-w-2xl` instead).
3. **Always Run the Two Magic Commands Before Sharing Code**  
   Before creating a Pull Request or committing changes, run:
   ```bash
   # 1. Run all automated tests (should be all green / passing)
   npm test --prefix frontend

   # 2. Run the production build check (catches any broken links or TypeScript errors)
   npm run build --prefix frontend
   ```
   If both pass, your code is 100% safe to merge!

---

## 6. Saving Your Work with Git (The Friendly Cheatsheet)

When you're happy with your changes:

```bash
# 1. See what files you modified
git status

# 2. Review the exact lines you changed
git diff

# 3. Stage the files for saving
git add .

# 4. Commit with a clear, short description of what you did
git commit -m "update: add quick preset chips to discount calculator"

# 5. Push your changes to GitHub
git push
```

---

## 7. Need Help?

* **Something looks weird in the browser?** Check the Terminal running `npm run dev` or press `F12` in your browser to check the Console tab for red error messages.
* **A test failed?** The test runner output in your terminal will print the exact file name and line number where the expectation failed.
