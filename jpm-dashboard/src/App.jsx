import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  ShieldAlert,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Sparkles,
  Loader2,
  Users,
  RefreshCw,
  Filter,
  Download,
} from "lucide-react";

// --- 1. MOCK DATA GENERATION (Synthetic Financial Data) ---
const generatePortfolioData = () => {
  const segments = ["Mass Market", "Affluent", "High Net Worth"];
  const regions = ["North America", "EMEA", "APAC", "LatAm"];
  const data = [];

  for (let i = 0; i < 200; i++) {
    const segment = segments[Math.floor(Math.random() * segments.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];

    let baseBalance, baseLimit, riskFactor;

    if (segment === "High Net Worth") {
      baseBalance = 50000 + Math.random() * 150000;
      baseLimit = 100000;
      riskFactor = 0.1;
    } else if (segment === "Affluent") {
      baseBalance = 15000 + Math.random() * 50000;
      baseLimit = 40000;
      riskFactor = 0.3;
    } else {
      baseBalance = 1000 + Math.random() * 10000;
      baseLimit = 15000;
      riskFactor = 0.6;
    }

    const utilization = Math.min(baseBalance / baseLimit, 1.2);
    let riskScore = Math.random() * 0.4 + utilization * 0.5;
    if (segment === "Mass Market") riskScore += 0.1;
    riskScore = Math.min(Math.max(riskScore, 0.01), 0.99);

    const defaultFlag = Math.random() < (riskScore > 0.75 ? 0.4 : 0.02);
    const annualRevenue = baseBalance * 0.04 + Math.random() * 500;

    data.push({
      customerId: `CUST-${1000 + i}`,
      segment,
      region,
      accountBalance: Math.round(baseBalance),
      creditLimit: baseLimit,
      utilization: parseFloat(utilization.toFixed(2)),
      riskScore: parseFloat(riskScore.toFixed(3)),
      annualRevenue: Math.round(annualRevenue),
      defaultFlag,
    });
  }
  return data;
};

// --- 2. UTILITY COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const KPICard = ({ title, value, subtext, icon: Icon, trend, gradient }) => (
  <Card className="p-6 flex items-start justify-between transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
    <div>
      <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      {subtext && (
        <div
          className={`flex items-center mt-2 text-sm font-semibold ${trend === "positive" ? "text-emerald-600" : trend === "negative" ? "text-rose-600" : "text-slate-500"}`}
        >
          {trend === "positive" ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : trend === "negative" ? (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          ) : null}
          {subtext}
        </div>
      )}
    </div>
    <div className={`p-3 rounded-lg ${gradient}`}>
      <Icon size={22} className="text-white" />
    </div>
  </Card>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
      {title}
    </h2>
    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

// --- 3. MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const [portfolioData, setPortfolioData] = useState(generatePortfolioData());
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const apiKey = import.meta.env?.VITE_GROQ_API_KEY || "";

  // Refresh data function
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setPortfolioData(generatePortfolioData());
      setAiAnalysis(null);
      setIsRefreshing(false);
    }, 800);
  };

  // Filtered data based on selections
  const filteredData = useMemo(() => {
    return portfolioData.filter((d) => {
      const segmentMatch =
        selectedSegment === "all" || d.segment === selectedSegment;
      const regionMatch =
        selectedRegion === "all" || d.region === selectedRegion;
      return segmentMatch && regionMatch;
    });
  }, [portfolioData, selectedSegment, selectedRegion]);

  // --- Data Aggregation Logic ---
  const metrics = useMemo(() => {
    const totalBalance = filteredData.reduce(
      (acc, curr) => acc + curr.accountBalance,
      0,
    );
    const totalRevenue = filteredData.reduce(
      (acc, curr) => acc + curr.annualRevenue,
      0,
    );
    const avgRisk =
      filteredData.reduce((acc, curr) => acc + curr.riskScore, 0) /
      filteredData.length;
    const defaults = filteredData.filter((d) => d.defaultFlag).length;
    const defaultRate = (defaults / filteredData.length) * 100;

    return {
      totalBalance,
      totalRevenue,
      avgRisk,
      defaultRate,
    };
  }, [filteredData]);

  const segmentData = useMemo(() => {
    const agg = {};
    filteredData.forEach((d) => {
      if (!agg[d.segment])
        agg[d.segment] = {
          name: d.segment,
          value: 0,
          balance: 0,
          count: 0,
          revenue: 0,
        };
      agg[d.segment].value += d.annualRevenue;
      agg[d.segment].balance += d.accountBalance;
      agg[d.segment].revenue += d.annualRevenue;
      agg[d.segment].count += 1;
    });
    return Object.values(agg);
  }, [filteredData]);

  const regionData = useMemo(() => {
    const agg = {};
    filteredData.forEach((d) => {
      if (!agg[d.region]) agg[d.region] = { name: d.region, revenue: 0 };
      agg[d.region].revenue += d.annualRevenue;
    });
    return Object.values(agg).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData]);

  const riskVsRevData = useMemo(() => {
    return filteredData
      .map((d) => ({
        x: d.riskScore,
        y: d.annualRevenue,
        z: d.segment,
        fill: d.defaultFlag ? "#ef4444" : "#14b8a6",
      }))
      .slice(0, 150);
  }, [filteredData]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  const formatCompact = (val) =>
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      style: "currency",
      currency: "USD",
    }).format(val);

  // --- GROQ API Logic ---
  const generateAIInsights = async () => {
    if (isGenerating) return;

    if (!apiKey) {
      alert(
        "Missing Groq API Key. Please add VITE_GROQ_API_KEY to your .env file in the root folder.",
      );
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `
        You are a Senior Risk Analyst at J.P. Morgan. Analyze the following portfolio snapshot:
        - Total Balance: ${formatCurrency(metrics.totalBalance)}
        - Annual Revenue: ${formatCurrency(metrics.totalRevenue)}
        - Avg Risk Score: ${metrics.avgRisk.toFixed(3)} (Scale 0-1)
        - Default Rate: ${metrics.defaultRate.toFixed(2)}%
        - Top Performing Region: ${regionData[0]?.name || "N/A"} (${regionData[0] ? formatCurrency(regionData[0].revenue) : "N/A"})
        - Segment Breakdown: ${segmentData.map((s) => `${s.name}: ${formatCompact(s.value)} rev`).join(", ")}

        Provide a response in VALID JSON format with exactly this structure:
        {
          "insights": [
            "Insight 1 (focus on revenue vs risk)",
            "Insight 2 (focus on regional or segment trends)",
            "Insight 3 (critical risk warning)"
          ],
          "recommendation": "One clear, strategic action for the Portfolio Manager."
        }
        Do not include markdown formatting. Return only the raw JSON.
      `;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful financial analyst assistant that outputs strict JSON.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response:", errorText);
        throw new Error(
          `Groq API Error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      setAiAnalysis(content);
    } catch (error) {
      console.error("AI Generation failed:", error);
      setAiAnalysis({
        insights: [
          "Service Unavailable. Please check your API key in the .env file.",
          "Ensure VITE_GROQ_API_KEY is set correctly.",
          "Check browser console for detailed error information.",
        ],
        recommendation:
          "Proceed with manual analysis or verify API credentials.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF Generation Function
  const generatePDF = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Risk & Revenue Report - J.P. Morgan</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          body {
            font-family: 'Arial', sans-serif;
            color: #1e293b;
            line-height: 1.6;
          }
          .header {
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            color: white;
            padding: 30px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
          }
          .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .kpi-box {
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            background: #f8fafc;
          }
          .kpi-title {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .kpi-value {
            font-size: 28px;
            font-weight: bold;
            color: #0f172a;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .data-table th {
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #cbd5e1;
          }
          .data-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          .insight-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 10px 0;
          }
          .recommendation-box {
            background: #f0fdf4;
            border: 2px solid #86efac;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Retail Risk & Revenue Analysis</h1>
          <p>J.P. Morgan Portfolio Report | Generated ${new Date().toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          )}</p>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-title">Portfolio Balance</div>
            <div class="kpi-value">${formatCompact(metrics.totalBalance)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Annual Revenue</div>
            <div class="kpi-value">${formatCompact(metrics.totalRevenue)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Average Risk Score</div>
            <div class="kpi-value">${metrics.avgRisk.toFixed(3)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Default Rate</div>
            <div class="kpi-value">${metrics.defaultRate.toFixed(1)}%</div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Segment Performance Analysis</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Total Balance</th>
                <th>Annual Revenue</th>
                <th>Customer Count</th>
              </tr>
            </thead>
            <tbody>
              ${segmentData
                .map(
                  (segment) => `
                <tr>
                  <td><strong>${segment.name}</strong></td>
                  <td>${formatCurrency(segment.balance)}</td>
                  <td>${formatCurrency(segment.revenue)}</td>
                  <td>${segment.count}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Regional Revenue Distribution</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Annual Revenue</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${regionData
                .map(
                  (region) => `
                <tr>
                  <td><strong>${region.name}</strong></td>
                  <td>${formatCurrency(region.revenue)}</td>
                  <td>${((region.revenue / metrics.totalRevenue) * 100).toFixed(1)}%</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        ${
          aiAnalysis
            ? `
          <div class="section">
            <h2 class="section-title">AI-Generated Insights</h2>
            ${aiAnalysis.insights
              .map(
                (insight, idx) => `
              <div class="insight-box">
                <strong>Insight ${idx + 1}:</strong> ${insight}
              </div>
            `,
              )
              .join("")}
            
            <div class="recommendation-box">
              <strong style="color: #166534; font-size: 16px;">Strategic Recommendation</strong>
              <p style="margin: 10px 0 0 0; color: #15803d;">${aiAnalysis.recommendation}</p>
            </div>
          </div>
        `
            : ""
        }

        <div class="section">
          <h2 class="section-title">Risk Assessment Summary</h2>
          <p>The current portfolio demonstrates a default rate of <strong>${metrics.defaultRate.toFixed(2)}%</strong>, 
          which is ${metrics.defaultRate > 4.5 ? "above" : "below"} the acceptable threshold of 4.5%. 
          The average risk score across all accounts is <strong>${metrics.avgRisk.toFixed(3)}</strong>.</p>
          
          <p>Key observations:</p>
          <ul>
            <li>Total accounts analyzed: <strong>${filteredData.length}</strong></li>
            <li>High Net Worth segment contributes approximately <strong>${((segmentData.find((s) => s.name === "High Net Worth")?.value / metrics.totalRevenue) * 100).toFixed(0)}%</strong> of total revenue</li>
            <li>Leading region: <strong>${regionData[0]?.name || "N/A"}</strong> with ${regionData[0] ? formatCurrency(regionData[0].revenue) : "N/A"} in annual revenue</li>
          </ul>
        </div>

        <div class="footer">
          <p><strong>Report prepared by:</strong> Lucky J. Daniel | J.P. Morgan Risk Analytics</p>
          <p>This is a demonstration dashboard created with React.js, Recharts, and Groq AI</p>
          <p style="margin-top: 10px; font-style: italic;">Confidential - For Internal Use Only</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            // Close the window after printing (optional)
            // setTimeout(() => window.close(), 1000);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  // Vibrant color palettes
  const SEGMENT_COLORS = {
    "Mass Market": "#8b5cf6",
    Affluent: "#ec4899",
    "High Net Worth": "#f59e0b",
  };

  const REGION_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                Retail Risk & Revenue
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Portfolio Snapshot
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <span className="hidden md:block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              Live Demo
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filter Controls */}
        <Card className="p-4 bg-gradient-to-r from-white to-slate-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-600" />
              <span className="font-semibold text-slate-700">Filters:</span>
            </div>

            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-purple-200 rounded-lg font-medium text-slate-700 hover:border-purple-400 focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="all">All Segments</option>
              <option value="Mass Market">Mass Market</option>
              <option value="Affluent">Affluent</option>
              <option value="High Net Worth">High Net Worth</option>
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 bg-white border-2 border-blue-200 rounded-lg font-medium text-slate-700 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="all">All Regions</option>
              <option value="North America">North America</option>
              <option value="EMEA">EMEA</option>
              <option value="APAC">APAC</option>
              <option value="LatAm">LatAm</option>
            </select>

            <div className="ml-auto text-sm text-slate-600 font-medium">
              Displaying{" "}
              <span className="text-blue-600 font-bold">
                {filteredData.length}
              </span>{" "}
              of {portfolioData.length} records
            </div>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Portfolio Balance"
            value={formatCompact(metrics.totalBalance)}
            subtext="+12.5% vs Last Year"
            trend="positive"
            icon={Wallet}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <KPICard
            title="Annual Revenue"
            value={formatCompact(metrics.totalRevenue)}
            subtext="+8.2% vs Target"
            trend="positive"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          />
          <KPICard
            title="Avg. Risk Score"
            value={metrics.avgRisk.toFixed(3)}
            subtext="Model v4.2 (Scale 0-1)"
            trend="neutral"
            icon={Activity}
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          />
          <KPICard
            title="Default Rate"
            value={`${metrics.defaultRate.toFixed(1)}%`}
            subtext="Above threshold (>4.5%)"
            trend="negative"
            icon={ShieldAlert}
            gradient="bg-gradient-to-br from-rose-500 to-red-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: Portfolio Balance by Segment */}
          <Card className="col-span-1 lg:col-span-2 p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <SectionHeader
                title="Portfolio Composition"
                subtitle="Total outstanding balance per customer segment"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    chartType === "bar"
                      ? "bg-purple-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    chartType === "line"
                      ? "bg-purple-500 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Line
                </button>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart
                    data={segmentData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      {segmentData.map((entry, index) => (
                        <linearGradient
                          key={index}
                          id={`colorGradient${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={SEGMENT_COLORS[entry.name]}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={SEGMENT_COLORS[entry.name]}
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={formatCompact}
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="balance"
                      name="Balance"
                      radius={[8, 8, 0, 0]}
                      barSize={60}
                    >
                      {segmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#colorGradient${index})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart
                    data={segmentData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={formatCompact}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: "#8b5cf6", r: 6 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Side Chart: Revenue by Region */}
          <Card className="col-span-1 p-6 border-2 border-blue-100">
            <SectionHeader
              title="Regional Performance"
              subtitle="Annual revenue contribution"
            />
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {REGION_COLORS.map((color, index) => (
                      <linearGradient
                        key={index}
                        id={`regionGradient${index}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor={color}
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {regionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#regionGradient${index})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCompact(value)}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Second Row: Risk Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scatter: Risk vs Revenue */}
          <Card className="p-6 border-2 border-teal-100">
            <SectionHeader
              title="Risk-Return Profile"
              subtitle="Revenue vs. Probability of Default (Risk Score)"
            />
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Risk Score"
                    unit=""
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Revenue"
                    unit="$"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={formatCompact}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border-2 border-teal-200 shadow-lg rounded-lg">
                            <p className="font-semibold text-slate-800">
                              {payload[0].payload.z}
                            </p>
                            <p className="text-sm text-slate-600">
                              Rev: {formatCurrency(payload[0].value)}
                            </p>
                            <p className="text-sm text-slate-600">
                              Risk: {payload[0].payload.x.toFixed(2)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Customers" data={riskVsRevData} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-4 justify-center text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span>{" "}
                Defaulted
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-teal-500 shadow-sm"></span>{" "}
                Current
              </div>
            </div>
          </Card>

          {/* AI Insights Panel */}
          <Card className="p-0 border-l-4 border-l-gradient-to-b from-blue-500 to-purple-500 shadow-lg">
            <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
                      {isGenerating ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <h3 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {aiAnalysis ? "AI Analyst Report" : "Automated Insights"}
                    </h3>
                  </div>
                  {!aiAnalysis && !isGenerating && (
                    <button
                      onClick={generateAIInsights}
                      className="text-xs flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                    >
                      ✨ Generate AI
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {isGenerating ? (
                    <div className="text-center py-10 text-slate-500 text-sm animate-pulse">
                      Analyzing portfolio metrics via Groq (Llama 3)...
                    </div>
                  ) : aiAnalysis ? (
                    <>
                      {aiAnalysis.insights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                        >
                          <span className="font-bold text-purple-300 text-2xl">
                            0{idx + 1}
                          </span>
                          <p className="text-slate-700 leading-relaxed text-sm">
                            {insight}
                          </p>
                        </div>
                      ))}
                      <div className="mt-4 p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg border-2 border-blue-200 shadow-sm">
                        <strong className="block text-blue-900 text-xs uppercase tracking-wide mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Strategic Recommendation
                        </strong>
                        <p className="text-slate-800 text-sm font-medium italic">
                          "{aiAnalysis.recommendation}"
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-3 p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                        <span className="font-bold text-purple-300 text-2xl">
                          01
                        </span>
                        <p className="text-slate-700 leading-relaxed text-sm">
                          <strong className="text-purple-700">
                            High Net Worth Dominance:
                          </strong>{" "}
                          HNW customers constitute only 18% of the base but
                          generate
                          <span className="font-semibold text-blue-700">
                            {" "}
                            {(
                              (segmentData.find(
                                (s) => s.name === "High Net Worth",
                              )?.value /
                                metrics.totalRevenue) *
                              100
                            ).toFixed(0)}
                            %
                          </span>{" "}
                          of total revenue.
                        </p>
                      </div>
                      <div className="flex gap-3 p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                        <span className="font-bold text-purple-300 text-2xl">
                          02
                        </span>
                        <p className="text-slate-700 leading-relaxed text-sm">
                          <strong className="text-purple-700">
                            Risk Concentration:
                          </strong>{" "}
                          The{" "}
                          {
                            segmentData.find((s) => s.name === "Mass Market")
                              ?.name
                          }{" "}
                          segment shows a default rate correlation of
                          <span className="font-semibold text-rose-600">
                            {" "}
                            0.65
                          </span>{" "}
                          with utilization rates above 80%.
                        </p>
                      </div>
                      <div className="flex gap-3 p-3 bg-white rounded-lg shadow-sm border border-slate-100">
                        <span className="font-bold text-purple-300 text-2xl">
                          03
                        </span>
                        <p className="text-slate-700 leading-relaxed text-sm">
                          <strong className="text-purple-700">
                            Regional Opportunity:
                          </strong>{" "}
                          {regionData[0].name} leads in revenue, suggesting a
                          targeted campaign to increase credit limits for
                          Affluent customers in this region could yield +$1.2M.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={generatePDF}
                  className="w-full py-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-semibold hover:from-slate-800 hover:to-black transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Full Risk Report (PDF)
                </button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Users size={16} />
            <span>
              Built by{" "}
              <strong className="text-slate-700">Lucky J. Daniel</strong>
            </span>
          </div>
          <div className="flex gap-6 text-xs font-medium">
            <span className="text-blue-600">React.js</span>
            <span className="text-purple-600">Recharts</span>
            <span className="text-pink-600">Tailwind CSS</span>
            <span className="text-emerald-600">Groq AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
