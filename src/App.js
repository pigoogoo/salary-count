import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const WORKERS = ['帥哥', '三色蛋'];
const HOURLY_RATE_USD = 10;

const LOCAL_STORAGE_KEY = 'salary_count_records'; // 🌟 定義localStorage的Key

const App = () => {
  const [records, setRecords] = useState(() => {
    // 🌟 初始化從localStorage讀取資料
    const storedRecords = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedRecords ? JSON.parse(storedRecords) : [];
  });

  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [worker, setWorker] = useState(WORKERS[0]);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isLoadingRate, setIsLoadingRate] = useState(false);

  // 🌟 每次 records 更新的時候，存到localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      if (data && data.rates && data.rates.TWD) {
        setExchangeRate(data.rates.TWD);
      } else {
        setExchangeRate(null);
      }
    } catch (error) {
      console.error('匯率API錯誤:', error);
      setExchangeRate(null);
    }
    setIsLoadingRate(false);
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const addRecord = () => {
    const totalSeconds =
        parseInt(hours || 0) * 3600 +
        parseInt(minutes || 0) * 60 +
        parseInt(seconds || 0);

    if (!date || totalSeconds === 0) {
      alert('請輸入日期和工時');
      return;
    }

    const newRecord = {
      id: Date.now(),
      date,
      worker,
      totalSeconds,
    };

    setRecords([...records, newRecord]);
    setHours('');
    setMinutes('');
    setSeconds('');
  };

  const deleteRecord = (id) => {
    setRecords(records.filter((record) => record.id !== id));
  };

  const calculateTotals = () => {
    const summary = {};
    WORKERS.forEach((w) => {
      summary[w] = 0;
    });
    records.forEach((record) => {
      summary[record.worker] += record.totalSeconds;
    });
    return summary;
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}時 ${m}分 ${s}秒`;
  };

  const calculateSalary = (seconds) => {
    const hours = seconds / 3600;
    const usd = hours * HOURLY_RATE_USD;
    const twd = exchangeRate ? (usd * exchangeRate).toFixed(2) : 'N/A';
    return { usd: usd.toFixed(2), twd };
  };

  const totals = calculateTotals();
  const totalAllSeconds = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-lime-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-700 mb-8">
            工時計算 & 薪資換算
          </h1>

          <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
              <input type="number" placeholder="時" value={hours} onChange={(e) => setHours(e.target.value)} className="input" />
              <input type="number" placeholder="分" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="input" />
              <input type="number" placeholder="秒" value={seconds} onChange={(e) => setSeconds(e.target.value)} className="input" />
              <select value={worker} onChange={(e) => setWorker(e.target.value)} className="input">
                {WORKERS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                ))}
              </select>
              <button onClick={addRecord} disabled={isLoadingRate} className="btn-primary relative cursor-pointer py-4 px-2 text-center font-barlow inline-flex
              justify-center text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-4 overflow-hidden">
                <span className="relative z-20 text-black">新增工時!</span>

                <span
                    className="absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                ></span>

                <span
                    className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[black] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0"
                ></span>
                <span
                    className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[black] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0"
                ></span>
                <span
                    className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[black] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0"
                ></span>
                <span
                    className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[black] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0"
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button onClick={fetchExchangeRate} disabled={isLoadingRate} className="btn-secondary relative cursor-pointer py-4 px-8 text-center font-barlow inline-flex
              justify-center text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-4 overflow-hidden">
                  <span className="relative z-20 text-black">更新匯率!</span>

                  <span
                      className="absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"
                  ></span>

                  <span
                      className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[black] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0"
                  ></span>
                  <span
                      className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[black] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0"
                  ></span>
                  <span
                      className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[black] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0"
                  ></span>
                  <span
                      className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[black] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0"
                  ></span>
              </button>

              {exchangeRate && (
                  <div className="text-lg font-semibold text-green-700">
                    1 美金 ≈ {exchangeRate} 台幣
                  </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-700 mb-4">紀錄</h2>
          <div className="space-y-4">
            {records.map((record) => (
                <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white p-4 shadow-md rounded-xl"
                >
                  <div>
                    <div className="text-gray-800">{record.date} - {record.worker}</div>
                    <div className="text-gray-500">{formatTime(record.totalSeconds)}</div>
                  </div>
                  <button
                      onClick={() => deleteRecord(record.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    刪除
                  </button>
                </motion.div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">統計</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {WORKERS.map((w) => {
              const salary = calculateSalary(totals[w]);
              return (
                  <motion.div
                      key={w}
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-white p-6 shadow-xl rounded-xl text-center"
                  >
                    <div className="text-xl font-bold text-gray-800 mb-2">{w}</div>
                    <div className="text-gray-500 mb-1">{formatTime(totals[w])}</div>
                    <div className="text-green-700 font-semibold">{salary.usd} 美金 / {salary.twd} 台幣</div>
                  </motion.div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <div className="text-lg text-gray-600 mb-2">總工時</div>
            <div className="text-2xl font-bold text-gray-800">{formatTime(totalAllSeconds)}</div>
            <div className="text-lg text-gray-600 mt-4">總薪水</div>
            <div className="text-2xl font-bold text-green-700">
              {(() => {
                const salary = calculateSalary(totalAllSeconds);
                return `${salary.usd} 美金 / ${salary.twd} 台幣`;
              })()}
            </div>
          </div>
        </div>
      </div>
  );
};

export default App;
