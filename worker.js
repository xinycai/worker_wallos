export default {
	async fetch(request, env) {
		return await handleRequest(request, env);
	}
}

async function handleRequest(request, env) {
	const url = new URL(request.url);
	const base = env.url;
	const api_key = env.key;

	const apiUrl = base + '/api/subscriptions/get_subscriptions.php' +
		'?api_key=' + encodeURIComponent(api_key) +
		'&convert_currency=true';

	if (url.pathname === '/api/data') {
		return await getSubscriptionData(apiUrl);
	}

	return new Response(generateHTML(base), {
		headers: {
			'content-type': 'text/html;charset=UTF-8',
		},
	});
}

async function getSubscriptionData(apiUrl) {
	try {
		const response = await fetch(apiUrl);
		const data = await response.json();
		return new Response(JSON.stringify(data), {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
				'cache-control': 'no-cache, no-store, must-revalidate',
			},
		});
	} catch (error) {
		return new Response(JSON.stringify({
			error: 'Failed to fetch data',
			message: error.message,
			stack: error.stack
		}), {
			status: 500,
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		});
	}
}

function generateHTML(url) {
	return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>订阅管理</title>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
      <style>
        .card {
          background-color: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          padding: 1rem;
          margin-bottom: 1rem;
        }
        .stat-card {
          background-color: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          text-align: center;
        }
        .logo {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          border-radius: 8px;
          background-color: #4f9ff5;
        }
        .logo-text {
          position: relative;
        }
        .logo-text::before {
          content: "";
          position: absolute;
          width: 12px;
          height: 12px;
          background-color: #9cc4ff;
          border-radius: 50%;
          left: 4px;
          top: 50%;
          transform: translateY(-50%);
        }
        .logo-text span {
          margin-left: 10px;
        }
        .search-box {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 300px;
        }
        .dropdown {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background-color: white;
        }
        .chart-container {
          height: 250px;
          width: 100%;
          margin-bottom: 2rem;
        }
        .price-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .price-main {
          font-weight: bold;
          color: #333;
        }
        .price-secondary {
          font-size: 0.8rem;
          color: #777;
        }
      </style>
    </head>
    <body class="bg-gray-100 min-h-screen p-4">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold mb-6">订阅管理</h1>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="stat-card">
            <div class="text-4xl font-bold text-blue-500 mb-1" id="active-subscriptions">--</div>
            <div class="text-gray-500">活跃订阅</div>
          </div>
          <div class="stat-card">
            <div class="text-4xl font-bold text-blue-500 mb-1" id="monthly-cost">--</div>
            <div class="text-gray-500">月费用</div>
          </div>
          <div class="stat-card">
            <div class="text-4xl font-bold text-blue-500 mb-1" id="yearly-cost">--</div>
            <div class="text-gray-500">年费用</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="stat-card">
            <div class="text-4xl font-bold text-blue-500 mb-1" id="avg-monthly">--</div>
            <div class="text-gray-500">平均每订阅每月费用</div>
          </div>
          <div class="stat-card">
            <div class="text-4xl font-bold text-blue-500 mb-1" id="most-expensive">--</div>
            <div class="text-gray-500" id="most-expensive-name">最昂贵订阅费用</div>
          </div>
          <div class="stat-card">
            <div class="text-4xl font-bold text-blue-500 mb-1" id="current-payment">--</div>
            <div class="text-gray-500">本月应付金额</div>
          </div>
        </div>
        <!-- Controls -->
        <div class="flex flex-col md:flex-row justify-between items-center mb-6">
          <div class="mb-4 md:mb-0">
            <input type="text" id="search" placeholder="搜索订阅..." class="search-box">
          </div>
          <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
			<div class="dropdown">
			  <a href="${url}" target="_blank">管理页面</a>
			</div>
            <select id="price-view" class="dropdown">
              <option value="monthly">显示月付价格</option>
              <option value="yearly">显示年付价格</option>
            </select>
            <select id="sort-by" class="dropdown">
              <option value="default">默认排序</option>
              <option value="price-high">价格 (高到低)</option>
              <option value="price-low">价格 (低到高)</option>
              <option value="date">最近扣款日期</option>
            </select>
          </div>
        </div>

        <div id="other-categories"></div>

        <div class="card mb-6">
          <h2 class="text-xl font-bold mb-4">订阅费用统计</h2>
          <div class="chart-container">
            <canvas id="subscriptionChart"></canvas>
          </div>
        </div>
      </div>

      <script>
        let subscriptionsData = [];
        let filteredData = [];

        function formatCurrency(amount) {
          return '¥' + amount.toFixed(2);
        }

		function formatDate(dateString) {
		  const date = new Date(dateString);
		  const year = date.getFullYear();
		  const month = date.getMonth() + 1;
		  const day = date.getDate();
		  return year + '年' + month + '月' + day + '日';
		}

		function calculateYearlyPrice(price, cycle, frequency) {
		  if (cycle === 4) {
			return price / frequency;
		  } else if (cycle === 3) {
			return price * 12 / frequency;
		  }
		  return price;
		}

		function calculateMonthlyPrice(price, cycle, frequency) {
		  if (cycle === 3) {
			return price / frequency;
		  } else if (cycle === 4) {
			return price / frequency / 12;
		  }
		  return price;
		}

		function getCycleText(cycle, frequency) {
		  if (cycle === 3) {
			return frequency === 1 ? '每月' : '每' + frequency + '月';
		  } else if (cycle === 4) {
			return frequency === 1 ? '每年' : '每' + frequency + '年';
		  } else {
			return '';
		  }
		}

        function renderSubscriptions() {
          const otherContainer = document.getElementById('other-categories');

          otherContainer.innerHTML = '';

          const categoryContainers = {};

          filteredData.forEach(sub => {
            if (!categoryContainers[sub.category_name]) {
                const categoryHeader = document.createElement('h2');
                categoryHeader.className = 'text-xl font-bold mb-4';
                categoryHeader.textContent = sub.category_name;
                otherContainer.appendChild(categoryHeader);
                const container = document.createElement('div');
                otherContainer.appendChild(container);
                categoryContainers[sub.category_name] = container;
            }

            const card = document.createElement('div');
            card.className = 'card flex justify-between items-center';

            const priceView = document.getElementById('price-view').value;
            let displayPrice, currencySymbol;

			if (priceView === 'monthly') {
			  displayPrice = calculateMonthlyPrice(sub.price, sub.cycle, sub.frequency);
			  currencySymbol = '¥';
			} else {
			  displayPrice = calculateYearlyPrice(sub.price, sub.cycle, sub.frequency);
			  currencySymbol = '¥';
			}

            card.innerHTML =
            '<div class="flex items-center">' +
              '<div class="ml-4">' +
                '<div class="font-bold">' + sub.name + '</div>' +
                '<div class="text-sm text-gray-500 flex items-center">' +
                  '<span>' + getCycleText(sub.cycle, sub.frequency) + '</span>' +
                  '<span>付款￥' + sub.price.toFixed(2) + '</span>' +
                '</div>' +
                '<div class="text-sm text-gray-500 flex items-center">' +
                  '<span>下次付款时间：</span>' +
                  '<span>' + formatDate(sub.next_payment) + '</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="flex items-center">' +
              '<div class="price-container mr-4">' +
                '<div class="price-main">' + currencySymbol + displayPrice.toFixed(2) + '</div>' +
                '<div class="text-sm text-gray-500">' + (priceView === 'monthly' ? '月付价' : '年付价') +'</div>' +
              '</div>' +
            '</div>';


            categoryContainers[sub.category_name].appendChild(card);
          });
        }

        function updateStats() {
          if (subscriptionsData.length === 0) return;

          const activeCount = subscriptionsData.length;

          let monthlyTotal = 0;
          let yearlyTotal = 0;
          let mostExpensiveMonthly = 0;
          let mostExpensiveName = '';
          let currentMonthPayment = 0;

          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();

          subscriptionsData.forEach(sub => {
            const monthlyPrice = calculateMonthlyPrice(sub.price, sub.cycle, sub.frequency);
            const yearlyPrice = calculateYearlyPrice(sub.price, sub.cycle, sub.frequency);

            monthlyTotal += monthlyPrice;
            yearlyTotal += yearlyPrice;

            if (monthlyPrice > mostExpensiveMonthly) {
              mostExpensiveMonthly = monthlyPrice;
              mostExpensiveName = sub.name;
            }

            const paymentDate = new Date(sub.next_payment);
            if (paymentDate.getMonth() + 1 === currentMonth && paymentDate.getFullYear() === currentYear) {
              currentMonthPayment += sub.price;
            }
          });

          document.getElementById('active-subscriptions').textContent = activeCount;
          document.getElementById('monthly-cost').textContent = formatCurrency(monthlyTotal);
          document.getElementById('yearly-cost').textContent = formatCurrency(yearlyTotal);

          document.getElementById('avg-monthly').textContent = formatCurrency(monthlyTotal / activeCount);
          document.getElementById('most-expensive').textContent = formatCurrency(mostExpensiveMonthly);
          document.getElementById('most-expensive-name').textContent = mostExpensiveName + ' 最昂贵订阅费用';
          document.getElementById('current-payment').textContent = formatCurrency(currentMonthPayment);

          renderChart(subscriptionsData);
        }

        function renderChart(data) {
          const ctx = document.getElementById('subscriptionChart').getContext('2d');

          const categories = {};
          let totalCost = 0;

          data.forEach(sub => {
            const monthlyPrice = calculateMonthlyPrice(sub.price, sub.cycle, sub.frequency);

            if (!categories[sub.category_name]) {
              categories[sub.category_name] = 0;
            }

            categories[sub.category_name] += monthlyPrice;
            totalCost += monthlyPrice;
          });

          const categoryNames = Object.keys(categories);
          const categoryValues = Object.values(categories);
          const categoryColors = generateColors(categoryNames.length);
          if (window.myChart) {
            window.myChart.destroy();
          }

          window.myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: categoryNames,
              datasets: [{
                data: categoryValues,
                backgroundColor: categoryColors,
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const value = context.raw;
                      const percentage = Math.round((value / totalCost) * 100);
                      return \`\${context.label}: \${formatCurrency(value)} (\${percentage}%)\`;
                    }
                  }
                }
              }
            }
          });
        }
        function generateColors(count) {
          const colors = [
            '#4f9ff5', '#f5724f', '#4ff57d', '#f54f9f', '#9f4ff5',
            '#f5d34f', '#4ff5e8', '#a1f54f', '#f54f4f', '#4f76f5'
          ];

          if (count > colors.length) {
            for (let i = colors.length; i < count; i++) {
              const r = Math.floor(Math.random() * 200) + 55;
              const g = Math.floor(Math.random() * 200) + 55;
              const b = Math.floor(Math.random() * 200) + 55;
              colors.push(\`rgb(\${r}, \${g}, \${b})\`);
            }
          }

          return colors.slice(0, count);
        }

        function filterAndSortSubscriptions() {
          const searchTerm = document.getElementById('search').value.toLowerCase();
          const sortBy = document.getElementById('sort-by').value;

          filteredData = subscriptionsData.filter(sub => {
            return sub.name.toLowerCase().includes(searchTerm) ||
                   sub.category_name.toLowerCase().includes(searchTerm);
          });

          switch (sortBy) {
            case 'price-high':
              filteredData.sort((a, b) => {
                const priceA = calculateMonthlyPrice(a.price, a.cycle, a.frequency);
                const priceB = calculateMonthlyPrice(b.price, b.cycle, b.frequency);
                return priceB - priceA;
              });
              break;
            case 'price-low':
              filteredData.sort((a, b) => {
                const priceA = calculateMonthlyPrice(a.price, a.cycle, a.frequency);
                const priceB = calculateMonthlyPrice(b.price, b.cycle, b.frequency);
                return priceA - priceB;
              });
              break;
            default:
              filteredData.sort((a, b) => {
                return new Date(a.next_payment) - new Date(b.next_payment);
              });
              break;
          }
          renderSubscriptions();
        }

        async function fetchData() {
          try {
            const response = await fetch('/api/data');
            const data = await response.json();

            if (data.success && data.subscriptions) {
              subscriptionsData = data.subscriptions;
              filteredData = [...subscriptionsData];

              updateStats();
              filterAndSortSubscriptions();
            }
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        }

        document.getElementById('search').addEventListener('input', filterAndSortSubscriptions);
        document.getElementById('sort-by').addEventListener('change', filterAndSortSubscriptions);
        document.getElementById('price-view').addEventListener('change', renderSubscriptions);

        fetchData();
      </script>
    </body>
    </html>
    `;
}
