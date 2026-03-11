import { useState, useEffect } from 'react';
import { useAnalyticsData } from '../components/analytics/useAnalyticsData';
import SummaryCards from '../components/analytics/SummaryCards';
import TransactionTypeTabs from '../components/analytics/TransactionTypeTabs';
import PeriodSelector from '../components/analytics/PeriodSelector';
import DateNavigator from '../components/analytics/DateNavigator';
import CategoryPieChart from '../components/analytics/CategoryPieChart';
import TimeBarChart from '../components/analytics/TimeBarChart';
import AIInsights from '../components/AIInsights';

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState('month');
  const [transactionType, setTransactionType] = useState('expense');
  const [selectedDate, setSelectedDate] = useState('');
  const [visibleCategories, setVisibleCategories] = useState(new Set());

  const { loading, categoryStats, chartData, summary } = useAnalyticsData(
    transactionType,
    timePeriod,
    selectedDate
  );

  // Initialize with today's date
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
  }, []);

  // Initialize visible categories when stats load
  useEffect(() => {
    if (categoryStats?.by_category) {
      setVisibleCategories(new Set(categoryStats.by_category.map(c => c.category)));
    }
  }, [categoryStats]);

  function navigateDate(direction) {
    const date = new Date(selectedDate);
    let newDate;

    if (timePeriod === 'day') {
      newDate = new Date(date);
      newDate.setDate(date.getDate() + direction);
    } else if (timePeriod === 'week') {
      newDate = new Date(date);
      newDate.setDate(date.getDate() + (direction * 7));
    } else {
      newDate = new Date(date);
      newDate.setMonth(date.getMonth() + direction);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    newDate.setHours(0, 0, 0, 0);

    if (newDate <= today) {
      setSelectedDate(newDate.toISOString().split('T')[0]);
    }
  }

  function goToToday() {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }

  function getCurrentPeriodLabel() {
    const date = new Date(selectedDate);
    const options = {
      year: 'numeric',
      month: 'long',
      day: timePeriod === 'month' ? undefined : 'numeric'
    };
    return date.toLocaleDateString('ru-RU', options);
  }

  function toggleCategoryVisibility(category) {
    setVisibleCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  function toggleAllCategories(visible) {
    if (visible && categoryStats?.by_category) {
      setVisibleCategories(new Set(categoryStats.by_category.map(c => c.category)));
    } else {
      setVisibleCategories(new Set());
    }
  }

  function handlePeriodChange(period) {
    setTimePeriod(period);
    goToToday();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
        <p className="text-gray-600 mt-1">Детальный анализ ваших финансов</p>
      </div>

      {summary && (
        <SummaryCards
          summary={summary}
          transactionType={transactionType}
          periodLabel={getCurrentPeriodLabel()}
        />
      )}

      {/* AI Рекомендации */}
      <AIInsights days={30} />

      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
        <TransactionTypeTabs
          value={transactionType}
          onChange={setTransactionType}
        />

        <PeriodSelector
          value={timePeriod}
          onChange={handlePeriodChange}
        />

        <DateNavigator
          selectedDate={selectedDate}
          timePeriod={timePeriod}
          onNavigate={navigateDate}
          onToday={goToToday}
          periodLabel={getCurrentPeriodLabel()}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">По категориям</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAllCategories(true)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                title="Показать все"
              >
                <i className="fas fa-eye"></i>
              </button>
              <button
                onClick={() => toggleAllCategories(false)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                title="Скрыть все"
              >
                <i className="fas fa-eye-slash"></i>
              </button>
              <span className="text-sm text-gray-500">
                {visibleCategories.size}/{categoryStats?.by_category?.length || 0}
              </span>
            </div>
          </div>

          <CategoryPieChart
            categoryStats={categoryStats}
            visibleCategories={visibleCategories}
            onToggleCategory={toggleCategoryVisibility}
            onToggleAll={toggleAllCategories}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {chartData?.title || 'Динамика'}
            </h2>
            <span className="text-sm text-gray-500">
              {chartData?.labels?.length || 0}
            </span>
          </div>

          <TimeBarChart
            chartData={chartData}
            transactionType={transactionType}
          />
        </div>
      </div>
    </div>
  );
}
