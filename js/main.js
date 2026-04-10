document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. 深淺色「拉下序幕」切換邏輯
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
      
      // 2. 拉下布幕
      curtain.classList.add('drop');

      // 3. 等布幕蓋住畫面後 (600ms)，切換主題並換圖示
      setTimeout(() => {
        htmlElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
        updateThemeIcon(targetTheme);
        
        // 4. 收起布幕
        curtain.style.top = '100vh'; // 讓它繼續往下掉出畫面 (比較酷)
        
        setTimeout(() => {
          // 重置布幕位置回上方，為下次做準備
          curtain.classList.remove('drop');
          curtain.style.transition = 'none'; // 瞬間移回上方不顯示動畫
          curtain.style.top = '-100vh';
          
          setTimeout(() => {
            curtain.style.transition = ''; // 恢復動畫屬性
            isAnimating = false;
          }, 50);
        }, 600);
      }, 600); // 對應 CSS 的 0.6s
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
    const iconBtn = toggle.querySelector('.toggle-icon-btn');
    const postList = toggle.nextElementSibling;

    if (iconBtn && postList) {
      iconBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggle.classList.toggle('open'); 
        if (toggle.classList.contains('open')) {
          postList.style.maxHeight = postList.scrollHeight + 'px';
        } else {
          postList.style.maxHeight = null;
        }
      });
    }
  });
});