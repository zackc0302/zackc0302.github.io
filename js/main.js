document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. 深淺色「淡出淡入」切換邏輯
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const htmlElement = document.documentElement;
  const curtain = document.getElementById('theme-curtain');
  
  const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
  const sunIcon = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';

  const currentTheme = localStorage.getItem('theme') || 'light';
  htmlElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggleBtn) {
    let isAnimating = false;

    themeToggleBtn.addEventListener('click', () => {
      if (isAnimating) return; // 避免狂點
      isAnimating = true;

      const currentTheme = htmlElement.getAttribute('data-theme');
      const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // 1. 設定布幕顏色 (根據目標主題決定)
      curtain.style.backgroundColor = targetTheme === 'dark' ? '#111111' : '#ffffff';
      
      // 2. 淡出並縮小布幕
      curtain.classList.add('fade');

      // 3. 等布幕完全蓋住畫面後 (250ms)，切換主題並換圖示
      setTimeout(() => {
        // 先更新資料屬性 - 觸發 MutationObserver 監聽器（給首頁的地球使用）
        htmlElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
        updateThemeIcon(targetTheme);
        
        // 4. 移除布幕並重置
        curtain.classList.remove('fade');
        isAnimating = false;
      }, 250);
    });
  }

  function updateThemeIcon(theme) {
    if (themeIcon) themeIcon.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
  }

  // ==========================================
  // 2. 語言與側邊欄切換
  // ==========================================
  // 語言切換保持不變
  const langToggleBtn = document.getElementById('lang-toggle');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/en/')) {
        window.location.href = currentPath.replace('/en/', '/');
      } else {
        window.location.href = currentPath === '/' ? '/en/' : '/en' + currentPath;
      }
    });
  }

  // 側邊欄切換 (綁定同一個按鈕)
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle'); // 更改為 toggle

  function toggleSidebar() {
    sidebar?.classList.toggle('active');
    overlay?.classList.toggle('active');
    document.body.style.overflow = sidebar?.classList.contains('active') ? 'hidden' : '';
  }

  sidebarToggleBtn?.addEventListener('click', toggleSidebar);
  overlay?.addEventListener('click', toggleSidebar);

  // ==========================================
  // 3. 分類下拉 (Accordion)
  // ==========================================
  const catToggles = document.querySelectorAll('.cat-toggle');
  catToggles.forEach(toggle => {
    const postList = toggle.nextElementSibling;

    // 點擊整個分類區域都可以展開/收起
    toggle.addEventListener('click', (e) => {
      // 避免重複觸發（按鈕本身不需要 preventDefault）
      toggle.parentElement.classList.toggle('open');
      if (toggle.parentElement.classList.contains('open')) {
        postList.style.maxHeight = postList.scrollHeight + 'px';
      } else {
        postList.style.maxHeight = null;
      }
    });
  });

  // ==========================================
  // 4. 文章目錄 TOC 生成
  // ==========================================
  const tocNav = document.querySelector('.toc-nav');
  const postContent = document.querySelector('.post-content');

  if (tocNav && postContent) {
    // 掃描 post-content 中的標題
    const headings = postContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length > 0) {
      const toc = document.createElement('ul');
      let currentLevel = 0;
      let currentUl = toc;
      const stack = [toc]; // 用來追蹤嵌套的 ul

      headings.forEach((heading, index) => {
        // 給標題加 ID（如果沒有）
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }

        const level = parseInt(heading.tagName[1]); // h1 = 1, h2 = 2 ...
        
        // 處理嵌套層級
        if (level > currentLevel) {
          for (let i = currentLevel; i < level; i++) {
            const newUl = document.createElement('ul');
            if (currentUl.lastElementChild) {
              currentUl.lastElementChild.appendChild(newUl);
            } else {
              const li = document.createElement('li');
              li.appendChild(newUl);
              currentUl.appendChild(li);
            }
            stack.push(newUl);
            currentUl = newUl;
          }
          currentLevel = level;
        } else if (level < currentLevel) {
          for (let i = level; i < currentLevel; i++) {
            stack.pop();
            currentUl = stack[stack.length - 1];
          }
          currentLevel = level;
        }

        // 建立 TOC 項目
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        
        li.appendChild(a);
        currentUl.appendChild(li);
      });

      tocNav.appendChild(toc);

      // 平滑滾動
      tocNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    } else {
      // 如果沒有標題，隱藏 TOC 區塊
      tocNav.closest('.sidebar-widget').style.display = 'none';
    }
  }
});