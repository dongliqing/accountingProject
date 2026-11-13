from pathlib import Path

p = Path('index.html')
html = p.read_text(encoding='utf-8')

# 1) device label
old_label = '<div class="device-label"><b>02</b> 账单 <span>全部账本汇总 · 多账本隔离 · 跨账本转账</span></div>'
new_label = '<div class="device-label"><b>02</b> 账单 <span>按月汇总 · 账本切换 · 收入 / 支出 / 结余</span></div>'
assert old_label in html, 'label not found'
html = html.replace(old_label, new_label, 1)

# 2) replace bills screen scroll content + add ledger menu
s_start = html.index('id="f-bills"')
s_end = html.index('id="f-add"')
seg = html[s_start:s_end]
scroll_i = seg.index('<div class="scroll">')
nav_i = seg.index('<nav class="tabbar">')

NEW = '''<div class="scroll">
          <div class="topbar bills-topbar">
            <button class="back-btn" aria-label="返回">
              <svg class="ico" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>
            </button>
            <div class="bills-title">我的账单</div>
            <span class="bills-spacer"></span>
          </div>

          <div class="bills-ledger-row">
            <button class="book-chip" id="bills-book-chip">
              <i class="book-dot"></i><span id="bills-book-name">日常账本</span>
              <svg class="ico sm" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>

          <section class="bills-summary">
            <div class="blob b1"></div>
            <div class="blob b2"></div>
            <button class="bills-year" id="bills-year">
              <span id="bills-year-label">2026年</span>
              <svg class="ico sm" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="bills-label">结余</div>
            <div class="bills-amount"><small>¥</small><span id="bills-balance">13,260.00</span></div>
            <div class="bills-foot">
              <div><span>收入</span><b id="bills-income">¥90,260.00</b></div>
              <div><span>支出</span><b id="bills-expense">¥34,186.79</b></div>
            </div>
          </section>

          <div id="bills-months"></div>
        </div>

        <div class="bills-menu" id="bills-menu">
          <div class="bm-head"><b>切换账本</b><span>账单按账本独立统计</span></div>
          <button class="book-opt active" data-book="日常账本">
            <span class="opt-tile" style="background:#FFF3BF">
              <svg class="ico" style="width:18px;height:18px" viewBox="0 0 24 24"><path d="M4 11l8-6 8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>
            </span>
            <span class="opt-main"><b>日常账本</b><small>默认账本 · 日常收支</small></span>
            <span class="opt-check">✓</span>
          </button>
          <button class="book-opt" data-book="旅行账本">
            <span class="opt-tile" style="background:#E2F5F2">
              <svg class="ico" style="width:18px;height:18px" viewBox="0 0 24 24"><path d="M21 3L3 10l7 3 3 7 8-17z"/><path d="M10 13l5-5"/></svg>
            </span>
            <span class="opt-main"><b>旅行账本</b><small>出行与度假支出</small></span>
            <span class="opt-check">✓</span>
          </button>
          <button class="book-opt" data-book="装修账本">
            <span class="opt-tile" style="background:#FFEDD9">
              <svg class="ico" style="width:18px;height:18px" viewBox="0 0 24 24"><path d="M14 4l6 6-2.5 2.5-6-6z"/><path d="M11.5 6.5L4 14l6 6 7.5-7.5"/></svg>
            </span>
            <span class="opt-main"><b>装修账本</b><small>装修与家居采购</small></span>
            <span class="opt-check">✓</span>
          </button>
        </div>

        '''
new_seg = seg[:scroll_i] + NEW + seg[nav_i:]
html = html[:s_start] + new_seg + html[s_end:]

# 3) CSS before design notes
css_marker = '  /* ---------- design notes ---------- */'
assert css_marker in html, 'css marker not found'
CSS = '''  /* ---------- bills screen (simple monthly) ---------- */
  .bills-topbar { padding: 6px 2px 10px; }
  .back-btn {
    width: 38px; height: 38px; border-radius: 50%;
    background: #fff; border: 1px solid var(--line);
    display: grid; place-items: center; color: var(--ink); cursor: pointer;
  }
  .bills-title { font-size: 17px; font-weight: 800; letter-spacing: -0.01em; }
  .bills-spacer { width: 38px; height: 38px; flex: none; }
  .bills-ledger-row { display: flex; align-items: center; margin: 2px 0 12px; }
  .bills-summary {
    position: relative; overflow: hidden;
    background: linear-gradient(150deg, #FFE36E 0%, var(--yellow) 55%, #FFD324 100%);
    border-radius: 24px; padding: 16px 20px 15px;
    box-shadow: 0 18px 34px rgba(250, 197, 24, 0.28);
  }
  .bills-year {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(255, 255, 255, 0.4); border: 0; border-radius: 999px;
    padding: 5px 10px 5px 12px; font-size: 12px; font-weight: 800; cursor: pointer;
  }
  .bills-label { position: relative; font-size: 12px; font-weight: 700; opacity: 0.62; margin-top: 12px; }
  .bills-amount {
    position: relative; font-size: 36px; font-weight: 800;
    letter-spacing: -0.03em; line-height: 1.12; font-variant-numeric: tabular-nums;
  }
  .bills-amount small { font-size: 22px; font-weight: 800; margin-right: 2px; }
  .bills-foot {
    position: relative; display: flex; gap: 28px;
    margin-top: 13px; padding-top: 11px; border-top: 1px solid rgba(30, 28, 22, 0.14);
  }
  .bills-foot div { display: flex; align-items: baseline; gap: 5px; }
  .bills-foot span { font-size: 10.5px; font-weight: 700; opacity: 0.6; }
  .bills-foot b { font-size: 12.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
  #bills-months { margin-top: 14px; }
  .month-card {
    display: block; width: 100%; background: #fff; border: 0; border-radius: 18px;
    padding: 13px 16px 14px; margin-bottom: 9px; box-shadow: var(--shadow-card);
    text-align: left; cursor: pointer; font-family: inherit; color: inherit;
  }
  .month-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .month-head b { font-size: 14.5px; font-weight: 800; }
  .month-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .month-stats div { display: flex; flex-direction: column; gap: 3px; }
  .month-stats b { font-size: 13.5px; font-weight: 800; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; }
  .month-stats span { font-size: 10px; color: var(--muted); font-weight: 600; }
  .bills-menu {
    position: absolute; top: 108px; left: 16px; right: 16px;
    background: #fff; border-radius: 22px; padding: 12px;
    box-shadow: 0 26px 60px rgba(0, 0, 0, 0.26);
    z-index: 35; display: none;
  }
  .bills-menu.show { display: block; }
  .bills-menu .book-opt { padding: 9px; border-radius: 14px; }

'''
html = html.replace(css_marker, CSS + css_marker, 1)

# 4) JS: scope old book-opt handler to screen 04
old_js = "document.querySelectorAll('.book-opt').forEach((opt) => {"
assert old_js in html, 'old book-opt handler not found'
html = html.replace(old_js, "document.querySelectorAll('#f-switch .book-opt').forEach((opt) => {", 1)

# 5) JS: bills logic before saveBtn handler
js_marker = "  saveBtn.addEventListener('click', () => {"
assert js_marker in html, 'save handler not found'
BILLS_JS = """  // ---------- 账单：账本切换 + 月度数据 ----------
  const billsData = {
    '日常账本': {
      year: '2026年', balance: '13,260.00', income: '¥90,260.00', expense: '¥34,186.79',
      months: [
        ['11月', '¥9,800.00', '¥3,482.50', '¥6,317.50'],
        ['10月', '¥12,800.00', '¥4,314.79', '¥8,485.21'],
        ['9月', '¥21,000.00', '¥9,260.00', '¥11,740.00'],
        ['8月', '¥18,600.00', '¥6,820.30', '¥11,779.70'],
        ['7月', '¥16,200.00', '¥4,980.00', '¥11,220.00'],
        ['6月', '¥11,860.00', '¥5,329.20', '¥6,530.80']
      ]
    },
    '旅行账本': {
      year: '2026年', balance: '6,860.00', income: '¥20,000.00', expense: '¥13,140.00',
      months: [
        ['10月', '¥6,000.00', '¥2,860.00', '¥3,140.00'],
        ['9月', '¥4,000.00', '¥3,180.00', '¥820.00'],
        ['7月', '¥8,000.00', '¥5,600.00', '¥2,400.00'],
        ['5月', '¥2,000.00', '¥1,500.00', '¥500.00']
      ]
    },
    '装修账本': {
      year: '2026年', balance: '8,642.30', income: '¥40,000.00', expense: '¥31,357.70',
      months: [
        ['9月', '¥20,000.00', '¥12,450.00', '¥7,550.00'],
        ['8月', '¥15,000.00', '¥13,907.70', '¥1,092.30'],
        ['6月', '¥5,000.00', '¥5,000.00', '¥0.00']
      ]
    }
  };
  let billsBook = '日常账本';

  function billsMonthCard(m) {
    return `<button class="month-card">
      <div class="month-head"><b>${m[0]}</b><svg class="ico sm chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></div>
      <div class="month-stats">
        <div><b>${m[1]}</b><span>收入</span></div>
        <div><b>${m[2]}</b><span>支出</span></div>
        <div><b>${m[3]}</b><span>结余</span></div>
      </div>
    </button>`;
  }

  function renderBills() {
    const d = billsData[billsBook];
    document.getElementById('bills-book-name').textContent = billsBook;
    document.getElementById('bills-year-label').textContent = d.year;
    document.getElementById('bills-balance').textContent = d.balance;
    document.getElementById('bills-income').textContent = d.income;
    document.getElementById('bills-expense').textContent = d.expense;
    document.getElementById('bills-months').innerHTML = d.months.map(billsMonthCard).join('');
    document.querySelectorAll('#bills-menu .book-opt').forEach((o) => {
      o.classList.toggle('active', o.dataset.book === billsBook);
    });
  }

  const billsMenu = document.getElementById('bills-menu');
  document.getElementById('bills-book-chip').addEventListener('click', (e) => {
    e.stopPropagation();
    billsMenu.classList.toggle('show');
  });
  document.querySelectorAll('#bills-menu .book-opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      billsBook = opt.dataset.book;
      billsMenu.classList.remove('show');
      renderBills();
    });
  });
  document.addEventListener('click', (e) => {
    if (billsMenu.classList.contains('show') && !billsMenu.contains(e.target)) {
      billsMenu.classList.remove('show');
    }
  });
  renderBills();

"""
html = html.replace(js_marker, BILLS_JS + js_marker, 1)

p.write_text(html, encoding='utf-8')
print('index.html updated:', len(html))
