import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Target, Flame } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
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
} from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';

const Analytics = () => {
  const { weeklyData, monthlyData, habitBreakdown, stats } = useAnalytics();

  const COLORS = ['hsl(160, 84%, 39%)', 'hsl(45, 93%, 58%)', 'hsl(25, 95%, 53%)', 'hsl(217, 33%, 40%)'];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your progress over time</p>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Weekly Avg</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stats.weeklyAvg}%</p>
          </div>
          <div className="bg-gradient-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Best Day</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stats.bestDay}</p>
          </div>
          <div className="bg-gradient-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-streak" />
              <span className="text-sm text-muted-foreground">Total XP</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stats.totalXP}</p>
          </div>
          <div className="bg-gradient-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Perfect Days</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{stats.perfectDays}</p>
          </div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Weekly View
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Monthly View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6">
            {/* Weekly Completion Chart */}
            <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                Weekly Completion Rate
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(217, 33%, 17%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 40%, 98%)',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Completion']}
                    />
                    <Area
                      type="monotone"
                      dataKey="completion"
                      stroke="hsl(45, 93%, 58%)"
                      strokeWidth={2}
                      fill="url(#colorCompletion)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Habit Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                  Habits Breakdown
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={habitBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {habitBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(222, 47%, 10%)',
                          border: '1px solid hsl(217, 33%, 17%)',
                          borderRadius: '8px',
                          color: 'hsl(210, 40%, 98%)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {habitBreakdown.map((habit, index) => (
                    <div key={habit.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-xs text-muted-foreground">{habit.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                  Tasks Completed
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                      <XAxis dataKey="day" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(222, 47%, 10%)',
                          border: '1px solid hsl(217, 33%, 17%)',
                          borderRadius: '8px',
                          color: 'hsl(210, 40%, 98%)',
                        }}
                      />
                      <Bar dataKey="tasks" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            {/* Monthly Trend Chart */}
            <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                Monthly Completion Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                    <XAxis 
                      dataKey="week" 
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(215, 20%, 55%)"
                      fontSize={12}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(217, 33%, 17%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 40%, 98%)',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Avg Completion']}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgCompletion"
                      stroke="hsl(160, 84%, 39%)"
                      strokeWidth={2}
                      fill="url(#colorMonthly)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-border">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                Weekly XP Earned
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
                    <XAxis dataKey="week" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(217, 33%, 17%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 40%, 98%)',
                      }}
                      formatter={(value: number) => [`${value} XP`, 'Earned']}
                    />
                    <Bar dataKey="xpEarned" fill="hsl(45, 93%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
