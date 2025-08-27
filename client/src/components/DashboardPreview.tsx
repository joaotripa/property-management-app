import React from "react";

import { TrendingUp } from "lucide-react";

const DashboardPreview = () => {
  return (
    <section className="hidden md:block bg-primary-light/60 pt-2 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-3xl blur-3xl opacity-20 scale-105"></div>
          <div className="relative bg-white rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-border">
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
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Welcome back,
                  </h3>
                  <p className="text-dark mt-1">
                    Here&apos;s what&apos;s happening with your properties today
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-4 py-2 bg-success/10 text-success text-sm rounded-full font-medium">
                    +12.5% this month
                  </div>
                  <div className="px-4 py-2 bg-primary/10 text-primary text-sm rounded-full font-medium">
                    8 Properties Active
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 md:p-6 rounded-xl border border-primary/20">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                    $24,850
                  </div>
                  <div className="text-sm font-medium text-dark">
                    Monthly Revenue
                  </div>
                  <div className="text-xs text-success mt-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />↑ 8.2% vs last month
                  </div>
                </div>
                <div className="bg-gradient-to-br from-accent/10 to-accent/5 p-4 md:p-6 rounded-xl border border-accent/20">
                  <div className="text-2xl md:text-3xl font-bold text-accent mb-2">
                    94%
                  </div>
                  <div className="text-sm font-medium text-dark">
                    Occupancy Rate
                  </div>
                  <div className="text-xs text-success mt-2 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />↑ 2.1% vs last month
                  </div>
                </div>
                <div className="bg-gradient-to-br from-success/10 to-success/5 p-4 md:p-6 rounded-xl border border-success/20">
                  <div className="text-2xl md:text-3xl font-bold text-success mb-2">
                    24
                  </div>
                  <div className="text-sm font-medium text-dark">
                    Active Bookings
                  </div>
                  <div className="text-xs text-success mt-2">+3 this week</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-4 md:p-6 rounded-xl border border-purple-500/20">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">
                    4.8
                  </div>
                  <div className="text-sm font-medium text-dark">
                    Avg Rating
                  </div>
                  <div className="text-xs text-success mt-2">156 reviews</div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                <div className="bg-white border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground">
                      Revenue Trend
                    </h4>
                    <div className="text-sm text-dark">Last 6 months</div>
                  </div>
                  <div className="h-48 md:h-56 bg-gradient-to-r from-primary/5 via-accent/5 to-success/5 rounded-lg relative overflow-hidden">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 320 160"
                      fill="none"
                    >
                      <defs>
                        <linearGradient
                          id="revenueGradient"
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
                        <linearGradient
                          id="expenseGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#0EA5E9"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="#0EA5E9"
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

                      {/* Revenue area */}
                      <polygon
                        points="20,130 70,110 120,80 170,60 220,70 270,45 310,35 320,40 320,150 20,150"
                        fill="url(#revenueGradient)"
                      />
                      <polyline
                        points="20,130 70,110 120,80 170,60 220,70 270,45 310,35 320,40"
                        stroke="#6366F1"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Expense area */}
                      <polygon
                        points="20,140 70,125 120,95 170,85 220,90 270,70 310,60 320,65 320,150 20,150"
                        fill="url(#expenseGradient)"
                      />
                      <polyline
                        points="20,140 70,125 120,95 170,85 220,90 270,70 310,60 320,65"
                        stroke="#0EA5E9"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data points */}
                      <circle cx="170" cy="60" r="4" fill="#6366F1" />
                      <circle cx="270" cy="45" r="4" fill="#6366F1" />
                      <circle cx="310" cy="35" r="4" fill="#6366F1" />
                      <circle cx="170" cy="85" r="3" fill="#0EA5E9" />
                      <circle cx="270" cy="70" r="3" fill="#0EA5E9" />
                      <circle cx="310" cy="60" r="3" fill="#0EA5E9" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                      <span className="text-dark">Revenue</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-highlights rounded-full mr-2"></div>
                      <span className="text-dark">Expenses</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-foreground">
                      Top Properties
                    </h4>
                    <div className="text-sm text-dark">This month</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-primary rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Sunset Villa
                          </div>
                          <div className="text-sm text-dark">Miami Beach</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          $4,200
                        </div>
                        <div className="text-sm text-success">+12%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-highlights/10 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-highlights rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Ocean View Apt
                          </div>
                          <div className="text-sm text-dark">Santa Monica</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          $3,800
                        </div>
                        <div className="text-sm text-success">+8%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-success rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Downtown Loft
                          </div>
                          <div className="text-sm text-dark">Los Angeles</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          $3,200
                        </div>
                        <div className="text-sm text-success">+15%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            Garden Studio
                          </div>
                          <div className="text-sm text-dark">Portland</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          $2,800
                        </div>
                        <div className="text-sm text-success">+6%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-6">
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
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        New booking confirmed
                      </div>
                      <div className="text-xs text-dark">
                        Sunset Villa - Check-in March 15
                      </div>
                    </div>
                    <div className="text-xs text-dark">2 min ago</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-highlights/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-highlights rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        Payment received
                      </div>
                      <div className="text-xs text-dark">
                        Ocean View Apt - $3,800
                      </div>
                    </div>
                    <div className="text-xs text-dark">1 hour ago</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        Maintenance completed
                      </div>
                      <div className="text-xs text-dark">
                        Downtown Loft - AC repair
                      </div>
                    </div>
                    <div className="text-xs text-dark">3 hours ago</div>
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
