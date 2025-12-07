import React from "react";

const DashboardPreview = () => {
  return (
    <section
      className="hidden md:block relative pt-2 pb-16 overflow-visible"
      style={{ zIndex: 10 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative animate-fade-in">
          <div
            className="relative bg-background rounded-3xl shadow-lg border border-border overflow-hidden"
            style={{
              boxShadow:
                "0 10px 25px -5px rgba(47, 109, 242, 0.15), 0 0 0 1px rgba(47, 109, 242, 0.05)",
            }}
          >
            <div className="bg-muted px-6 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 bg-red-400 rounded-full"></div>
                    <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
                    <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8 lg:p-12">
              <div className="flex flex-col gap-2 mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back,
                </h3>
                <p className="text-muted-foreground mt-1">
                  Here&apos;s what&apos;s happening with your properties today
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-base text-muted-foreground">
                      Monthly Income
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-3xl font-semibold">$8,450</p>
                      <span className="text-xs font-medium text-success bg-success/10 rounded-full px-2 py-1">
                        +12.3%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-base text-muted-foreground">
                      Monthly Expenses
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-3xl font-semibold">$2,180</p>
                      <span className="text-xs font-medium text-destructive bg-destructive/10 rounded-full px-2 py-1">
                        +5.2%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-base text-muted-foreground">
                      Monthly Cash Flow
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-3xl font-semibold">$6,270</p>
                      <span className="text-xs font-medium text-success bg-success/10 rounded-full px-2 py-1">
                        +18.5%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-base text-muted-foreground">
                      Occupied Properties
                    </p>
                    <p className="text-3xl font-semibold">
                      6
                      <span className="text-xl font-medium text-muted-foreground">
                        /8
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground">
                      Cash Flow Trend
                    </h4>
                    <div className="text-sm text-muted-foreground">Last 6 months</div>
                  </div>
                  <div className="h-48 md:h-56 bg-gradient-to-r from-primary/5 to-primary/0 rounded-lg relative overflow-hidden">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 320 160"
                      fill="none"
                    >
                      <defs>
                        <linearGradient
                          id="cashFlowGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#6366F1"
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="100%"
                            stopColor="#6366F1"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <g stroke="#E2E8F0" strokeWidth="0.5" opacity="0.5">
                        <line x1="0" y1="30" x2="320" y2="30" />
                        <line x1="0" y1="60" x2="320" y2="60" />
                        <line x1="0" y1="90" x2="320" y2="90" />
                        <line x1="0" y1="120" x2="320" y2="120" />
                      </g>

                      {/* Cash Flow area */}
                      <polygon
                        points="20,120 70,105 120,85 170,75 220,65 270,50 310,40 320,35 320,150 20,150"
                        fill="url(#cashFlowGradient)"
                      />
                      <polyline
                        points="20,120 70,105 120,85 170,75 220,65 270,50 310,40 320,35"
                        stroke="#6366F1"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data points */}
                      <circle cx="120" cy="85" r="4" fill="#6366F1" />
                      <circle cx="220" cy="65" r="4" fill="#6366F1" />
                      <circle cx="310" cy="40" r="4" fill="#6366F1" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center mt-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                      <span className="text-muted-foreground">Cash Flow</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground">
                      Top Properties
                    </h4>
                    <div className="text-sm text-muted-foreground">This month</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-primary rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Sunset Apartments
                          </div>
                          <div className="text-sm text-muted-foreground">Rank #1</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          $2,850
                        </div>
                        <div className="text-sm text-success">+18%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Downtown Loft
                          </div>
                          <div className="text-sm text-muted-foreground">Rank #2</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          $1,920
                        </div>
                        <div className="text-sm text-success">+12%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-success rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Harbor View Studio
                          </div>
                          <div className="text-sm text-muted-foreground">Rank #3</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          $1,500
                        </div>
                        <div className="text-sm text-success">+8%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Garden Terrace
                          </div>
                          <div className="text-sm text-muted-foreground">Rank #4</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          $1,180
                        </div>
                        <div className="text-sm text-success">+5%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-foreground">
                    Recent Activity
                  </h4>
                  <button className="text-sm text-primary hover:text-primary/80">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        Income transaction added
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sunset Apartments - Rent Payment - $1,800
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">2h ago</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        New property added
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Harbor View Studio - San Francisco, CA
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">5h ago</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        Expense transaction updated
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Downtown Loft - Maintenance - $350
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">1d ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
