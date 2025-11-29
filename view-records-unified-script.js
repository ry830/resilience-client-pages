document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // グローバル変数とDOM要素の取得（修正・追加）
    // ------------------------------------
    const mindRecordList = document.getElementById('mindRecordList');
    const positiveRecordList = document.getElementById('positiveRecordList');
    const meditationRecordList = document.getElementById('meditationRecordList'); // ★追加★
    const clearAllButton = document.getElementById('clearAll');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // 記録タイプごとの色分けとラベル
    const typeStyles = {
        'positive': { color: '#2ecc71', label: 'ポジティブ日記', className: 'positive-record' },
        'mindRecord': { color: '#3498db', label: '思考変換トレーニング', className: 'mind-record' },
        'meditation': { color: '#9c27b0', label: '瞑想トレーニング', className: 'meditation-record' }
    };

    // ------------------------------------
    // データの読み込みと表示
    // ------------------------------------
    // view-records-unified-script.js の displayRecords 関数

// view-records-unified-script.js の displayRecords 関数
// view-records-unified-script.js の displayRecords 関数
function displayRecords() {
    // 共通関数getRecords()でログインユーザーの全記録を取得
    let allRecords = getRecords();

    // ------------------------------------
    // 日付フィルタリングのロジック
    // ------------------------------------
    const filterDate = localStorage.getItem('filterDate');
    let isFiltered = false;
    let filteredRecords = allRecords;
    let displayDateString = '全期間'; // ヘッダー表示用

    if (filterDate) {
        // YYYY-MM-DD形式で日付が一致する記録のみをフィルタリング
        filteredRecords = allRecords.filter(r => {
            if (r.date) {
                // filterDate (YYYY-MM-DD) と r.date (ISO) の日付部分が一致するかチェック
                return r.date.startsWith(filterDate);
            }
            return false;
        });
        isFiltered = true;

        // ★修正点: YYYY年 MM月 DD日 の形式でヘッダーに表示 ★
        const [year, month, day] = filterDate.split('-').map(Number);
        // Dateコンストラクタに YYYY, MM-1, DD を渡すことで、現地時間に固定される
        const localDate = new Date(year, month - 1, day); 
        
        displayDateString = `${localDate.getFullYear()}年 ${localDate.getMonth() + 1}月 ${localDate.getDate()}日の記録`; 
    }
    // ------------------------------------
    
    // ... (以下のロジックは変更なし) ...
    
    // 日付が新しい順にソート
    filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    // タブごとに記録を分離
    const mindRecords = filteredRecords.filter(r => r.type === 'mindRecord' || (!r.type && r.emotion && r.rootThought));
    const positiveRecords = filteredRecords.filter(r => r.type === 'positive');
    const meditationRecords = filteredRecords.filter(r => r.type === 'meditation');

    // 記録リストの描画
    renderRecords(mindRecordList, mindRecords, allRecords, isFiltered);
    renderRecords(positiveRecordList, positiveRecords, allRecords, isFiltered);
    renderRecords(meditationRecordList, meditationRecords, allRecords, isFiltered);

    // フィルタリング表示のメッセージを更新
    if (isFiltered) {
        document.querySelector('.unified-view-container h1').textContent = `📅 記録の振り返り (${displayDateString})`;
        document.querySelector('.unified-view-container p').textContent = 'カレンダーから選択された日付の記録を表示しています。';
    } else {
        document.querySelector('.unified-view-container h1').textContent = `📈 記録の振り返り (全期間)`;
        document.querySelector('.unified-view-container p').textContent = 'これまでの心の筋トレの記録を振り返りましょう。';
    }
    
    // フィルタリング完了後、LocalStorageから日付をクリア
    localStorage.removeItem('filterDate');
}

// view-records-unified-script.js の renderRecords 関数
function renderRecords(listElement, records, allRecords, isFiltered) {
    if (!listElement) return;
    listElement.innerHTML = '';
    
    // リストIDから現在のレコードタイプを判定
    let typeKey;
    if (listElement.id === 'positiveRecordList') {
        typeKey = 'positive';
    } else if (listElement.id === 'meditationRecordList') {
        typeKey = 'meditation';
    } else {
        typeKey = 'mindRecord';
    }
    
    const style = typeStyles[typeKey]; // デフォルトスタイル

    if (records.length === 0) {
        const message = isFiltered ? `この日付の ${style.label} の記録はありません。` : `${style.label} の記録はまだありません。`;
        listElement.innerHTML = `<p style="text-align:center; color:#888;">${message}</p>`;
        return;
    }

    records.forEach((item) => {
        const currentType = item.type || 'mindRecord'; 
        const currentStyle = typeStyles[currentType] || typeStyles['mindRecord'];

        const listItem = document.createElement('li');
        listItem.className = `record-list-item ${currentStyle.className}`;
        
        const date = new Date(item.date);
        const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        let contentHTML = '';
        let title = '';

        const factContent = item.fact && typeof item.fact === 'string' ? item.fact : '出来事の記録なし';

        if (currentType === 'positive') {
            const originText = item.origin === 'effort' ? '努力・行動' : (item.origin === 'luck' ? '運・他者要因' : '未選択');
            
            // ★★★ 修正点: 強度を英語から日本語に変換 ★★★
            let intensityText;
            switch(item.intensity) {
                case 'low':
                    intensityText = '小';
                    break;
                case 'medium':
                    intensityText = '中';
                    break;
                case 'high':
                    intensityText = '大';
                    break;
                default:
                    intensityText = '未記録';
            }
            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

            title = `🌟 ${factContent.substring(0, 50)}${factContent.length > 50 ? '...' : ''}`;
            
            contentHTML = `<p><strong>出来事:</strong> ${factContent.replace(/\n/g, '<br>')}</p>
                           <p><strong>原因:</strong> ${originText} | <strong>強度:</strong> ${intensityText}</p>`;
        } else if (currentType === 'meditation') { 
            const minutes = Math.floor(item.duration / 60);
            const seconds = item.duration % 60;
            const durationText = `${minutes}分${String(seconds).padStart(2, '0')}秒`;
            
            let mindsetText = '';
            switch(item.mindset) {
                case 'very_calm': mindsetText = '非常に穏やか (5)'; break;
                case 'calm': mindsetText = '穏やか (4)'; break;
                case 'normal': mindsetText = '普通 (3)'; break;
                case 'restless': mindsetText = '少し落ち着かない (2)'; break;
                case 'very_restless': mindsetText = '非常に落ち着かない (1)'; break;
                default: mindsetText = '未記録';
            }

            title = `🧘 瞑想完了 (${durationText})`;

            contentHTML = `<p><strong>完了時間:</strong> <span style="font-weight: bold; color: ${currentStyle.color};">${durationText}</span></p>
                           <p><strong>瞑想後の心の状態:</strong> ${mindsetText}</p>`;
        

        // view-records-unified-script.js の renderRecords 関数内 (思考変換トレーニングの描画部分)

        } else { // ★★★ 思考変換トレーニングの描画ロジックの修正 ★★★
            
            // 資源回答を安全に取得 (前回のロジックを維持)
            const getAnswer = (type) => {
                const answerObj = item.answers ? item.answers.find(a => a.type === type) : null;
                return answerObj ? (answerObj.answer || '未記録') : '未記録';
            };
            
            // ★★★ 追加: 最終評価を日本語に変換するためのマップ ★★★
            const thoughtAssessmentMap = {
                'bad_to_positive': '運が悪いと思っていたが、少しポジティブになれた気がした',
                'bad_to_negative': '運が悪いと思っていた、やはり辛いままだ',
                'neutral_to_positive': '運とは関係ない出来事だったが、少しポジティブになれた気がした',
                'neutral_to_neutral': '運とは関係ない出来事だった、特に何も感じなかった',
                'neutral_to_negative': '運とは関係ない出来事だったが、やはり辛いままだ',
                'good_to_more_positive': '運が良かった出来事だった、さらにポジティブになれた気がした',
                'good_to_anxious': '運が良かった出来事だったが、この先悪いことが起きるのではないかと不安だ'
            };
            
            const finalAssessmentKey = item.thoughtAssessment || '';
            const finalAssessmentText = thoughtAssessmentMap[finalAssessmentKey] || '未記録';
            // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

            title = `🔄 ${factContent.substring(0, 50)}${factContent.length > 50 ? '...' : ''}`;
            
            contentHTML = `
                <p style="margin-bottom: 5px;"><strong>元の事実:</strong> ${factContent.replace(/\n/g, '<br>')}</p>
                <p style="margin-bottom: 5px;"><strong>湧き出た感情:</strong> ${item.emotion || '未記録'}</p>
                <p style="margin-bottom: 5px;"><strong>思考のクセ:</strong> ${item.rootThought || '未記録'}</p>
                <hr style="margin: 10px 0; border-top: 1px dashed #ddd;">
                
                <p style="font-weight: bold; margin-bottom: 0;"> スキルへの変換:</p>
                <p style="padding-left: 10px; margin-top: 0; margin-bottom: 10px;">${getAnswer('skill').replace(/\n/g, '<br>')}</p>

                <p style="font-weight: bold; margin-bottom: 0;"> 人間関係への変換:</p>
                <p style="padding-left: 10px; margin-top: 0; margin-bottom: 10px;">${getAnswer('relation').replace(/\n/g, '<br>')}</p>

                <p style="font-weight: bold; margin-bottom: 0;"> 教訓への変換:</p>
                <p style="padding-left: 10px; margin-top: 0; margin-bottom: 15px;">${getAnswer('lesson').replace(/\n/g, '<br>')}</p>
                
                <hr style="margin: 10px 0; border-top: 1px solid #ccc;">
                <p style="font-weight: bold; color: #3498db; margin-bottom: 5px;">最終的な感情評価:</p>
                <p style="padding-left: 10px; margin-top: 0; font-style: italic;">${finalAssessmentText}</p>
                
                <button 
                    class="ai-summary-toggle-button button-primary" 
                    data-target="ai-summary-${item.id}"
                    style="margin-top: 15px; padding: 5px 15px; background-color: #fbc02d; color: #333; font-size: 0.9rem;">
                    🤖 AI総評を見る
                </button>
                
                <div id="ai-summary-${item.id}" class="ai-summary-area" style="display: none; border-left: 5px solid #fbc02d; background-color: #fffde7;">
                    <strong>🤖 AI総評:</strong><br>
                    ${(item.summary || 'AI総評はまだ生成されていません。').replace(/\n/g, '<br>')}
                </div>
            `;
        }
        
        // ... (以下、listItemの構築ロジックは省略しません) ...
        const recordId = item.id; 

        listItem.innerHTML = `
            <button class="delete-button" data-record-id="${recordId}">削除</button>
            <h4>${title}</h4>
            <p class="meta-info">種別: ${currentStyle.label} | 記録日: ${formattedDate}</p>
            <div class="content-details">${contentHTML}</div>
        `;
        listElement.appendChild(listItem);
    });
    
    // ★★★ 折りたたみボタンのイベントリスナーを追加 ★★★
    document.querySelectorAll('.ai-summary-toggle-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = e.target.dataset.target;
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const isHidden = targetElement.style.display === 'none';
                targetElement.style.display = isHidden ? 'block' : 'none';
                e.target.textContent = isHidden ? '🤖 AI総評を隠す' : '🤖 AI総評を見る';
            }
        });
    });
}


    // ------------------------------------
    // タブ切り替えロジック
    // ------------------------------------
    function activateTab(tabId) {
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const activeContent = document.getElementById(tabId);

        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            activateTab(tabId);
        });
    });

    // ------------------------------------
    // 削除ロジック (IDベース)
    // ------------------------------------
    [mindRecordList, positiveRecordList, meditationRecordList].forEach(list => { // ★瞑想リストを追加★
        if (list) {
            list.addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('delete-button')) {
                    const recordId = target.getAttribute('data-record-id');
                    
                    if (!recordId || recordId === 'undefined') {
                        alert('削除失敗: この記録は古い形式で保存されているため、安全に個別削除するにはシステム全体に大幅な改修が必要です。一時的にすべての記録をクリアすることを推奨します。');
                        return;
                    }
                    
                    deleteRecord(recordId); 
                }
            });
        }
    });

    function deleteRecord(recordId) {
        if (!confirm('この記録を削除してもよろしいですか？')) return;

        let allRecords = JSON.parse(localStorage.getItem('mindRecords') || '[]');
        
        const initialLength = allRecords.length;
        
        // IDが一致しないものだけを残した新しい配列を生成
        allRecords = allRecords.filter(r => r.id != recordId); 

        if (allRecords.length < initialLength) {
            localStorage.setItem('mindRecords', JSON.stringify(allRecords));
            displayRecords(); // 画面を再描画
            alert('記録を削除しました。');
            return;
        }
        alert('削除に失敗しました。');
    }

    if (clearAllButton) {
        clearAllButton.addEventListener('click', () => {
            if (confirm('!!警告!! すべての記録を削除してもよろしいですか？（非推奨）')) {
                localStorage.removeItem('mindRecords');
                displayRecords();
                alert('すべての記録が削除されました。');
            }
        });
    }

    // 初期化
    displayRecords();
    activateTab('mind-tab');
});