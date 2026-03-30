import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 部位對照表 (對應 DB 的 id)
const BODY_PART_MAP = {
  1: "胸", 2: "腿", 3: "背", 4: "肩", 
  5: "二頭", 6: "三頭", 7: "核心"
};

// 圓餅圖顏色配方
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];

export const WorkoutSummaryPieChart = ({ dailyData, exerciseList }) => {
  // 1. 轉換數據邏輯
  const stats = {};
  let totalSets = 0;

  Object.keys(dailyData).forEach(exId => {
    // 透過 exerciseId 找到對應的 body_part_id
    const exInfo = exerciseList.find(e => e.id === parseInt(exId));
    const partName = BODY_PART_MAP[exInfo?.body_part_id] || "其他";
    
    const setCount = dailyData[exId].length; // 該動作做了幾組
    stats[partName] = (stats[partName] || 0) + setCount;
    totalSets += setCount;
  });

  // 轉換成 Recharts 格式
  const chartData = Object.keys(stats).map(name => ({
    name,
    value: stats[name]
  }));

  if (totalSets === 0) return null;

  return (
    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff', borderRadius: '12px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>當日訓練部位分析 (總組數: {totalSets} 組)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};