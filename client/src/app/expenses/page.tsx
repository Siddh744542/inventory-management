"use client";

import {
  ExpenseByCategorySummary,
  useGetExpenseByCategoryQuery,
} from "@/state/api";
import { useMemo, useState } from "react";
import Header from "../(components)/Header";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type AggregatedDataItem = {
  name: string;
  color?: string;
  amount: number;
};

type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: expensesData,
    isError,
    isLoading,
  } = useGetExpenseByCategoryQuery();

  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategories === "All" || data.category === selectedCategories;
        const dataDate = parseDate(data.date);
        const matchDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const amount = parseInt(data.amount);
        if (!acc[data.category]) {
          acc[data.category] = { name: data.category, amount: 0 };
          acc[data.category].color = `#${Math.floor(
            Math.random() * 16777215
          ).toString(16)}`;
          acc[data.category].amount += amount;
        }
        return acc;
      }, {});
    return Object.values(filtered);
  }, [expenses, selectedCategories, startDate, endDate]);
  const ClassNames = {
    label: "block text-sm font-medium text-gray-700",
    selectInput:
      "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !expensesData) {
    return (
      <div className="items-center py-4 text-red-500">
        Failed to Fetch expenses
      </div>
    );
  }
  return (
    <div className="mb-5">
      {/* HEADER */}
      <Header name="Expenses" />
      <p className="tex-sm text-gray-500">
        A Visual representation of expenses over time.
      </p>
      {/* FILTERS */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/3 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            Filter by Category and Date
          </h3>

          <div className="space-y-4">
            {/* category */}
            <div>
              <label htmlFor="category" className={ClassNames.label}>
                Category
              </label>
              <select
                id="category"
                name="category"
                className={ClassNames.selectInput}
                defaultValue={"All"}
                onChange={(e) => setSelectedCategories(e.target.value)}
              >
                <option>All</option>
                <option>Office</option>
                <option>Professional</option>
                <option>Salaries</option>
              </select>
            </div>
            {/* start date  */}
            <div>
              <label htmlFor="start-date" className={ClassNames.label}>
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                name="start-date"
                className={ClassNames.selectInput}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {/* end date  */}
            <div>
              <label htmlFor="end-date" className={ClassNames.label}>
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                name="end-date"
                className={ClassNames.selectInput}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* CHART */}
        <div className="flex-grow bg-white shadow rounded-lg p-4 md:p-6">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={aggregatedData}
                cx="50%"
                cy="50%"
                label
                outerRadius={150}
                fill="#888fd8"
                dataKey="amount"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {aggregatedData.map(
                  (entry: AggregatedDataItem, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === activeIndex ? "rgb(29,78,216)" : entry.color
                      }
                    />
                  )
                )}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
