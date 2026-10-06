import { PdfElement } from '../types';

// Design-preview fixture: one of each element type, with deliberately long texts, many rows
// and long labels to stress pagination and layout. All people, companies and numbers here are
// fictional.
export const elementsOneOfEach: PdfElement[] = [
    {
        type: "cover_page",
        title: [{ text: "The json2pdf" }, { text: "Design Preview", accent: true }],
        subtitle: "Null & Void Labs — Department of Making PDFs Less Painful",
        badge: "Cover Page Example",
        footer: "Generated on April 1st, 2026, by a JSON file that refused to be a spreadsheet",
    },
    { type: "title", content: "Design Preview: <br><strong>All Elements</strong>" },
    { type: "subtitle", content: "Everything json2pdf can print, in one slightly ridiculous report" },

    { type: "page_break" },
    // -----------------------------
    // Long-form narrative (stress pagination)
    // -----------------------------
    {
        type: "paragraph",
        content:
            "This report follows Paula Promise, a senior developer who once spent three sprints fighting a PDF library that rendered every table as a single, very confident line of text. " +
            "Since switching to json2pdf, Paula sends an array of elements, drinks exactly one coffee, and receives a PDF that looks like it was designed on purpose. " +
            "Her team reports a 94% drop in the phrase \"why is this on page 7\", a measurable improvement in morale, and one developer who now voluntarily writes reports for fun. " +
            "During the last quarter the team shipped forty-two invoices, eleven dashboards and one birthday card for the office cat, all from JSON."
    },
    {
        type: "paragraph",
        content:
            "On the collaboration side, designers stopped sending screenshots with arrows saying \"make it look like this\", because the Tailwind element lets them write the layout directly. " +
            "As next steps, the team recommends adopting page breaks responsibly, resisting the urge to put a gauge chart on every page, and writing <strong>at least one</strong> test before Friday deploys."
    },

    { type: "page_break" },
    // -----------------------------
    // Lists (longer to test wrap + breaks)
    // -----------------------------
    {
        type: "numbered_list",
        items: [
            "Write the report as JSON",
            "POST it to /generate-pdf",
            "Receive a PDF",
            "Spend the time you saved explaining to your manager that yes, it really was that fast",
            "Add a cover page — because every report deserves a dramatic entrance (and a badge, and a subtitle, and a footer)",
            "Try landscape mode, realize the charts adapt to the page on their own, and quietly delete the 400-line CSS file you wrote in 2019 to fake it",
            "Seventh item (en español) para mezclar idiomas y revisar tipografía, acentos y saltos de línea",
            "Celebrate responsibly — final check for spacing, list markers and consistent indentation"
        ]
    },

    { type: "page_break" },
    // -----------------------------
    // Bullet Points
    // -----------------------------
    {
        type: "bullet_points",
        items: [
            "No more wrestling with absolute positioning",
            "Tables that break across pages like civilized tables",
            "Charts that render <strong>before</strong> the PDF is printed, not after",
            "A cover page so good your stakeholders will read past it"
        ]
    },

    { type: "page_break" },
    // -----------------------------
    // Metrics (add more + longer interpretations)
    // -----------------------------
    { type: "subtitle", content: "Metrics" },
    { type: "metric", title: "PDFs Generated", value: 1234, interpretation: "And zero of them had overlapping text" },
    { type: "metric", title: "Developer Happiness", value: "98%", severity: "success", interpretation: "The remaining 2% are still configuring wkhtmltopdf" },
    { type: "metric", title: "Coffee per Report", value: 0.5, severity: "warning", interpretation: "Dangerously low — baristas are concerned" },
    { type: "metric", title: "Pixels Out of Place", value: -5, severity: "error", interpretation: "Negative pixels are physically impossible; we are investigating" },
    { type: "metric", title: "Uptime", value: "99.91%", severity: "success", interpretation: "The 0.09% was a developer tripping over the server's power cable" },
    { type: "metric", title: "Bugs Blamed on CSS", value: 7, severity: "info", interpretation: "Mostly fair; 2 were actually caused by a missing closing tag" },
    { type: "metric", title: "Meetings Replaced by a PDF", value: "+14%", severity: "warning", interpretation: "Calendars are suspiciously empty; productivity is suspiciously high" },

    { type: "page_break" },
    // -----------------------------
    // Tables (more rows; multiple tables)
    // -----------------------------
    { type: "subtitle", content: "Tables" },
    {
        type: "table",
        title: "Table — Team Goals (Extended)",
        headers: ["Goal", "Owner", "Status", "Progress"],
        rows: [
            ["Replace the 2014 script", "Paula Promise", { text: "Active", severity: "success", variant: "outline" }, { type: "progress", value: 75 }],
            ["Explain margins to the intern", "Kevin Callback", { text: "In progress", severity: "info", variant: "solid" }, { type: "progress", value: 45 }],
            ["Delete final_v3_REAL.pdf", "Nina Nullpointer", { text: "Done", severity: "success", variant: "soft" }, { type: "progress", value: 100 }],
            ["Fit the invoice on one page", "Ricky Regex", { text: "At risk", severity: "warning", variant: "solid" }, { type: "progress", value: 28 }],
            ["Document the API (for real)", "Diana Deploy", { text: "In progress", severity: "info", variant: "outline" }, { type: "progress", value: 52 }],
            ["Defend page 2 to QA", "Oscar O'Notation", { text: "Blocked", severity: "error", variant: "solid" }, { type: "progress", value: 12 }],
            ["Yearly report in landscape", "Lola Localhost", { text: "Active", severity: "success", variant: "outline" }, { type: "progress", value: 67 }],
            ["Page numbers everywhere", "Max Mergeconflict", { text: "In progress", severity: "info", variant: "solid" }, { type: "progress", value: 49 }],
            ["One font (not Comic Sans)", "Bea Breakpoint", { text: "Done", severity: "success", variant: "soft" }, { type: "progress", value: 100 }],
            ["Stop print-and-scan", "Carl Cache", { text: "At risk", severity: "warning", variant: "outline" }, { type: "progress", value: 33 }],
            ["Refactor legacy generator", "Yara YAML", { text: "Active", severity: "success", variant: "solid" }, { type: "progress", value: 61 }],
            ["Shrink the cloud bill", "Tom Tabs", { text: "In progress", severity: "info", variant: "outline" }, { type: "progress", value: 41 }],
        ]
    },
    {
        type: "table",
        title: "Table — Monthly Summary (More Rows)",
        headers: ["Month", "PDFs", "Deploys", "Mood", "Notes"],
        rows: [
            ["Jan", 132, 18, { text: "OK", severity: "success", variant: "soft" }, "New year, new reports"],
            ["Feb", 154, 21, { text: "OK", severity: "success", variant: "soft" }, "Builds got faster; nobody knows why"],
            ["Mar", 201, 16, { text: "Grumpy", severity: "warning", variant: "solid" }, "Someone added a 90-column table"],
            ["Apr", 178, 19, { text: "OK", severity: "success", variant: "outline" }, "April Fools' report was too believable"],
            ["May", 223, 24, { text: "Grumpy", severity: "warning", variant: "outline" }, "Quarterly reports, all at once"],
            ["Jun", 190, 20, { text: "OK", severity: "success", variant: "soft" }, "Stabilization sprint (and pizza)"],
            ["Jul", 210, 23, { text: "OK", severity: "success", variant: "solid" }, "Automated the boring parts"],
            ["Aug", 242, 25, { text: "Grumpy", severity: "warning", variant: "solid" }, "The air conditioning broke, not the PDFs"],
            ["Sep", 198, 22, { text: "OK", severity: "success", variant: "outline" }, "Added page numbers everywhere"],
            ["Oct", 265, 27, { text: "Spooky", severity: "warning", variant: "solid" }, "A PDF appeared that nobody generated"],
            ["Nov", 230, 26, { text: "OK", severity: "success", variant: "soft" }, "Fewer reruns, more naps"],
            ["Dec", 175, 15, { text: "OK", severity: "success", variant: "soft" }, "Year-end report printed itself"],
        ]
    },


    { type: "page_break" },
    // Charts (more items; duplicates; long labels)
    // -----------------------------
    { type: "subtitle", content: "Charts" },

    // Bar chart with many categories (forces height)
    {
        type: "bar_chart",
        title: "PDFs Generated per Week",
        data: [
            { label: "Week 1", value: 120 },
            { label: "Week 2", value: 95 },
            { label: "Week 3", value: 140 },
            { label: "Week 4", value: 80 },
            { label: "Week 5", value: 160 },
            { label: "Week 6", value: 110 },
            { label: "Week 7", value: 130 },
            { label: "Week 8", value: 170 },
            { label: "Week 9", value: 90 },
            { label: "Week 10", value: 150 },
            { label: "Week 11", value: 105 },
            { label: "Week 12", value: 165 },
        ]
    },

    { type: "page_break" },
    // Pie chart with many slices (legend stress)
    {
        type: "pie_chart",
        title: "What Developers Do With the Time They Saved",
        data: [
            { label: "Naps", value: 12 },
            { label: "Side projects", value: 8 },
            { label: "Refactoring", value: 15 },
            { label: "Coffee", value: 10 },
            { label: "Meetings", value: 6 },
            { label: "Rubber duck", value: 9 },
            { label: "Tabs vs spaces", value: 14 },
            { label: "Memes", value: 11 },
            { label: "Docs", value: 7 },
            { label: "More PDFs", value: 8 },
        ]
    },

    { type: "page_break" },
    // Horizontal bar with long labels (wrap stress)
    {
        type: "horizontal_bar",
        title: "Happiness Score by Team — Long Labels",
        labels: [
            "Team A — Invoices, Receipts & Things Accountants Love",
            "Team B — Platform / Observability / Staring at Dashboards",
            "Team C — Frontend Experience & Pixel-Perfect Arguments",
            "Team D — Legacy Reports (Written in 2009, Feared Since)",
            "Team E — Security & Compliance & Saying No Politely"
        ],
        values: [85, 92, 78, 64, 88]
    },

    // Horizontal bar with mixed short/long values (label visibility test)
    {
        type: "horizontal_bar",
        title: "Skills Unlocked — Short Values (Label Visibility)",
        labels: [
            "Writing JSON",
            "Reading Docs",
            "Fixing Margins",
            "Explaining PDFs",
            "Using Word"
        ],
        values: [72, 15, 5, 45, 3]
    },

    { type: "page_break" },
    // Doughnut — Stress test (legend long + many slices)
    {
        type: "doughnut_chart",
        title: "Developer Archetypes — Stress Test (Long Labels + Many Items)",
        labels: [
            "THE NIGHT OWL — Commits at 3 a.m. and Writes the Best Reports Nobody Reads",
            "THE CERTIFIED PRAGMATIST — Ships on Time, Documents Everything, Suspiciously Calm",
            "THE 10X PDF WIZARD — High Impact on Layout, Typography and Office Morale",
            "THE CURIOUS INTERN — Steep Learning Curve, Asks Excellent Questions",
            "THE TECHNICAL SPECIALIST — Fixes Fonts, Margins and Mysterious Blank Pages",
            "THE TEAM LEAD — Coordinates Sprints, Reviews PRs, Survives on Coffee",
            "THE SWISS ARMY KNIFE — Covers Every Role During Holidays and Demos",
            "THE RISK TAKER — Deploys on Fridays, Somehow Always Gets Away With It",
            "THE ADMINISTRATOR — Reports, Spreadsheets and Validating Everything Twice",
            "THE RISING STAR — High Potential, Already Asking About Landscape Mode",
            "THE QUALITY GUARDIAN — Audits, Checklists and Pixel-Level Scrutiny",
            "THE SAFETY OFFICER — Backups, Rollbacks and a Healthy Fear of Production",
        ],
        // mixed sizes to create small and large slices
        values: [40, 40, 20, 9, 6, 8, 7, 5, 4, 6, 3, 2],
    },

    // Doughnut — Few items but VERY long labels (should still not cut)
    {
        type: "doughnut_chart",
        title: "Reasons for Switching — Few Items (Very Long Labels)",
        labels: [
            "Reason A — Our old generator rendered every chart as a beige rectangle and called it minimalism",
            "Reason B — A label with parentheses (case 2) and symbols — & / - just to be difficult",
            "Reason C — Accents for good measure: Operación, Dirección, Administración",
            "Reason D — The fourth reason is long because the legend must wrap without truncating",
            "Reason E — Final validation that nothing overflows in the PDF / SVG output",
        ],
        values: [22, 18, 16, 24, 20],
    },

    { type: "page_break" },
    // Radar with more axes
    {
        type: "radar_chart",
        title: "Developer Superpowers — Extended",
        subtitle: "More dimensions to test layout and label spacing",
        labels: ["Coding", "Design", "Testing", "Security", "Ops", "Communication", "Planning", "Napping"],
        values: [90, 70, 80, 60, 85, 72, 68, 95]
    },

    { type: "page_break" },
    // Stacked bar with more months + 3 series
    {
        type: "stacked_bar",
        title: "Where the PDFs Came From — 3 Series",
        data: [
            { label: "Jan, the month everyone promised to automate their reports", values: { "API": 320, "Scheduled jobs": 120, "Panic button": 90 } },
            { label: "Feb", values: { "API": 332, "Scheduled jobs": 132, "Panic button": 76 } },
            { label: "Mar", values: { "API": 301, "Scheduled jobs": 101, "Panic button": 88 } },
            { label: "Apr", values: { "API": 345, "Scheduled jobs": 140, "Panic button": 95 } },
            { label: "May", values: { "API": 360, "Scheduled jobs": 160, "Panic button": 110 } },
            { label: "Jun", values: { "API": 310, "Scheduled jobs": 125, "Panic button": 84 } },
        ]
    },

    { type: "page_break" },
    // Velocimeter (repeat to force near page breaks)
    {
        type: "velocimeter",
        title: "Report Confidence Level",
        subtitle: "How sure you are the PDF will look right on the first try",
        value: 78,
        min: 0,
        max: 100
    },
    {
        type: "velocimeter",
        title: "Report Confidence Level (Before json2pdf)",
        subtitle: "A different value to test repeated block pagination",
        value: 42,
        min: 0,
        max: 100
    },

    { type: "page_break" },
    // Scatter plot with more points
    {
        type: "scatter_plot",
        title: "Effort vs. Joy — More Points",
        x_axis: "Effort (story points)",
        y_axis: "Joy (smiles per sprint)",
        positions: [
            { label: "A", x: 10, y: 20 },
            { label: "B", x: 15, y: 30 },
            { label: "C", x: 40, y: 10 },
            { label: "D", x: 22, y: 18 },
            { label: "E", x: 35, y: 28 },
            { label: "F", x: 28, y: 12 },
            { label: "G", x: 45, y: 34 },
            { label: "H", x: 18, y: 25 },
            { label: "I", x: 12, y: 15 },
            { label: "J", x: 38, y: 22 },
        ]
    },

    { type: "page_break" },
    // -----------------------------
    // HTML + Tailwind (any Tailwind v4 class: grid, flex, tables, lists, arbitrary values)
    // -----------------------------
    { type: "subtitle", content: "HTML + Tailwind" },
    {
        type: "html",
        content: `
<div class="grid grid-cols-3 gap-4">
  <div class="rounded-xl bg-blue-50 p-4 ring-1 ring-blue-200">
    <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Hours saved</p>
    <p class="mt-1 text-3xl font-bold text-slate-900">48.2k</p>
    <p class="mt-1 text-sm text-emerald-600">▲ 12% vs last month</p>
  </div>
  <div class="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
    <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Happy developers</p>
    <p class="mt-1 text-3xl font-bold text-slate-900">1,284</p>
    <p class="mt-1 text-sm text-emerald-600">▲ 4.1%</p>
  </div>
  <div class="rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
    <p class="text-xs font-semibold uppercase tracking-wide text-rose-700">Blank pages</p>
    <p class="mt-1 text-3xl font-bold text-slate-900">0</p>
    <p class="mt-1 text-sm text-rose-600">▼ 100% (finally)</p>
  </div>
</div>`,
    },
    {
        type: "html",
        content: `
<div class="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-700 px-6 py-5 text-white shadow-lg">
  <div>
    <h3 class="text-lg font-semibold">Flex layout with a gradient</h3>
    <p class="text-sm text-blue-100">Any Tailwind utility works, including arbitrary values like <code class="rounded bg-white/15 px-1">w-[120px]</code>.</p>
  </div>
  <span class="inline-flex w-[120px] justify-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">On track</span>
</div>`,
    },
    {
        type: "html",
        content: `
<div class="mt-6 overflow-hidden rounded-xl border border-slate-200">
  <table class="w-full text-left text-sm">
    <thead class="bg-slate-100 text-xs uppercase text-slate-600">
      <tr><th class="px-4 py-3">Project</th><th class="px-4 py-3">Owner</th><th class="px-4 py-3">Status</th><th class="px-4 py-3 text-right">Coffee budget</th></tr>
    </thead>
    <tbody class="divide-y divide-slate-200">
      <tr class="odd:bg-white even:bg-slate-50"><td class="px-4 py-3 font-medium text-slate-900">Invoice generator</td><td class="px-4 py-3">Paula Promise</td><td class="px-4 py-3"><span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Done</span></td><td class="px-4 py-3 text-right tabular-nums">$12,000</td></tr>
      <tr class="odd:bg-white even:bg-slate-50"><td class="px-4 py-3 font-medium text-slate-900">Certificate printer</td><td class="px-4 py-3">Kevin Callback</td><td class="px-4 py-3"><span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">In progress</span></td><td class="px-4 py-3 text-right tabular-nums">$34,500</td></tr>
      <tr class="odd:bg-white even:bg-slate-50"><td class="px-4 py-3 font-medium text-slate-900">The legacy report</td><td class="px-4 py-3">Nina Nullpointer</td><td class="px-4 py-3"><span class="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">Blocked</span></td><td class="px-4 py-3 text-right tabular-nums">$58,200</td></tr>
    </tbody>
  </table>
</div>`,
    },
    {
        type: "html",
        content: `
<div class="mt-6 grid grid-cols-[1fr_2fr] gap-6">
  <ul class="list-disc space-y-1 pl-5 text-slate-700 marker:text-blue-500">
    <li>Unordered list</li>
    <li>With colored markers</li>
    <li>And spacing utilities</li>
  </ul>
  <ol class="list-decimal space-y-2 pl-5 text-slate-700">
    <li><span class="font-semibold text-slate-900">Ordered list</span> inside an arbitrary <code class="text-pink-600">grid-cols-[1fr_2fr]</code> grid</li>
    <li class="line-through decoration-rose-500">Exporting reports from a spreadsheet</li>
    <li><span class="bg-yellow-200 px-1">Highlighted text</span> and <span class="italic underline decoration-wavy decoration-blue-500">wavy underline</span></li>
  </ol>
</div>`,
    },

    { type: "page_break" },
    // -----------------------------
    // Extra: repeat a mini "Charts" block to guarantee breaks
    // -----------------------------
    { type: "subtitle", content: "Charts (Repeat Block)" },
    {
        type: "bar_chart",
        title: "Reports Shipped per Quarter (Repeat)",
        data: [
            { label: "Q1", value: 100 },
            { label: "Q2", value: 150 },
            { label: "Q3", value: 80 },
            { label: "Q4", value: 200 }
        ]
    },
    {
        type: "pie_chart",
        title: "Favorite Page Size (Repeat)",
        data: [
            { label: "A4", value: 20 },
            { label: "Letter", value: 10 },
            { label: "Landscape", value: 25 },
            { label: "Whatever fits", value: 45 },
        ]
    },
];
