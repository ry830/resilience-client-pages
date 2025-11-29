document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const authTitle = document.getElementById('authTitle');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    // ------------------------------------
    // フォーム切り替え関数
    // ------------------------------------
    function showForm(formType) {
        if (formType === 'login') {
            authTitle.textContent = 'ユーザーログイン';
            loginFormContainer.style.display = 'block';
            registerFormContainer.style.display = 'none';
        } else {
            authTitle.textContent = '新規アカウント登録';
            loginFormContainer.style.display = 'none';
            registerFormContainer.style.display = 'block';
        }
        errorMessage.textContent = ''; // エラーメッセージをクリア
    }

    // ------------------------------------
    // 認証シミュレーション関数（将来的にサーバー通信に置き換え）
    // ------------------------------------
    function getStoredUsers() {
        try {
            return JSON.parse(localStorage.getItem('registeredUsers') || '{}');
        } catch (e) {
            console.error("ユーザーデータの取得に失敗しました:", e);
            return {};
        }
    }

    function setErrorMessage(message) {
        errorMessage.textContent = message;
    }

    // ------------------------------------
    // 新規登録処理
    // ------------------------------------
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        const userId = document.getElementById('registerUserId').value;
        const password = document.getElementById('registerPassword').value;
        
        let users = getStoredUsers();

        if (users[userId]) {
            setErrorMessage('エラー: このユーザーIDは既に使用されています。');
            return;
        }

        if (userId.length < 4 || password.length < 6) {
             setErrorMessage('ユーザーIDは4文字以上、パスワードは6文字以上で設定してください。');
             return;
        }
        
        // ★★★ 注: サーバー実装前のため、LocalStorageに保存 ★★★
        users[userId] = { password: password }; // パスワードは本来ハッシュ化すべきです
        localStorage.setItem('registeredUsers', JSON.stringify(users));

        // 登録が成功したら、ログイン状態にし、トップページへリダイレクト
        localStorage.setItem('currentUserId', userId);
        alert(`ユーザーID: ${userId} で登録されました。`);
        window.location.href = 'index.html';
    });

    // ------------------------------------
    // ログイン処理
    // ------------------------------------
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        setErrorMessage('');
        
        const userId = document.getElementById('loginUserId').value;
        const password = document.getElementById('loginPassword').value;
        
        let users = getStoredUsers();

        const user = users[userId];

        if (user && user.password === password) {
            // ★★★ 成功: ログイン状態を保存し、トップページへリダイレクト ★★★
            localStorage.setItem('currentUserId', userId);
            window.location.href = 'index.html';
        } else {
            setErrorMessage('エラー: ユーザーIDまたはパスワードが正しくありません。');
        }
    });

    // ------------------------------------
    // イベントリスナー
    // ------------------------------------
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('register');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForm('login');
    });
    
    // ------------------------------------
    // 初期チェックと初期化
    // ------------------------------------
    showForm('login');
    
    // 既にログインしているかチェック
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
        // 既にログイン済みならトップページへリダイレクト
        window.location.href = 'index.html';
    }
});