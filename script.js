// script.js
// 全アプリケーション共通の記録管理ロジック (save, get, delete)
// ログインユーザーのID (currentUserId) に紐づけて記録を管理します。

/**
 * 記録をローカルストレージに保存する共通関数
 * @param {object} newRecord - 保存する新しい記録オブジェクト (mind, positive, meditation)
 * @returns {boolean} - 保存成功の可否
 */
function saveRecord(newRecord) {
    // ログイン中のユーザーIDを取得
    const currentUserId = localStorage.getItem('currentUserId');

    if (!currentUserId) {
        alert('ログイン情報が無効です。再度ログインしてください。');
        window.location.href = 'auth.html';
        return false;
    }

    // ユーザーIDを記録オブジェクトに追加
    newRecord.userId = currentUserId;

    try {
        const records = JSON.parse(localStorage.getItem('mindRecords') || '[]');
        
        // ユニークIDを付与 (既存のIDの最大値 + 1)
        // Note: 過去の記録と区別するため、idが存在しない場合は0と見なす
        const maxId = records.reduce((max, r) => Math.max(max, r.id || 0), 0);
        newRecord.id = maxId + 1;
        newRecord.timestamp = new Date().toISOString(); // 記録日時

        records.push(newRecord);
        localStorage.setItem('mindRecords', JSON.stringify(records));
        return true; // 保存成功
    } catch (e) {
        console.error("記録の保存中にエラーが発生しました:", e);
        return false; // 保存失敗
    }
}

// ------------------------------------------------------------------

/**
 * ログインユーザーの記録のみを取得する共通関数
 * @returns {Array<object>} - ログインユーザーの記録の配列
 */
function getRecords() {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
        // 未ログインの場合、index.htmlで認証チェックがあるため、ここでは空の配列を返して処理続行を許可
        return [];
    }

    try {
        const allRecords = JSON.parse(localStorage.getItem('mindRecords') || '[]');
        // ログインユーザーのIDと一致する記録のみをフィルタリング
        return allRecords.filter(record => record.userId === currentUserId);
    } catch (e) {
        console.error("記録の読み込み中にエラーが発生しました:", e);
        return [];
    }
}

// ------------------------------------------------------------------

/**
 * ログインユーザーの記録をIDで削除する共通関数
 * @param {number} recordId - 削除する記録のID (数値または文字列のID)
 * @returns {boolean} - 削除成功の可否
 */
function deleteRecord(recordId) {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) {
        return false;
    }

    try {
        const records = JSON.parse(localStorage.getItem('mindRecords') || '[]');
        const targetId = parseInt(recordId);

        // ログインユーザーが所有する記録かつIDが一致するものを除外した配列を生成
        const filteredRecords = records.filter(r => {
            const idMatch = (parseInt(r.id) === targetId);
            const userMatch = (r.userId === currentUserId);
            
            // 削除対象でなければtrueを返す（残す）
            return !(idMatch && userMatch);
        });
        
        // 記録の数が減っているかチェック
        if (records.length === filteredRecords.length) {
             return false; // 削除対象が見つからなかった
        }

        localStorage.setItem('mindRecords', JSON.stringify(filteredRecords));
        return true; // 削除成功
    } catch (e) {
        console.error("記録の削除中にエラーが発生しました:", e);
        return false;
    }
}