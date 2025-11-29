document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------
    // グローバル変数とDOM要素の取得
    // ------------------------------------
    const factTextarea = document.getElementById('factTextarea');
    const emotionTextarea = document.getElementById('emotionTextarea');
    const rootThoughtTextarea = document.getElementById('rootThoughtTextarea');
    const skillAnswerArea = document.getElementById('skillAnswer');
    const relationshipAnswerArea = document.getElementById('relationshipAnswer');
    const lessonAnswerArea = document.getElementById('lessonAnswer');
    // const luckySelect = document.getElementById('luckySelect'); // 削除
    const summaryArea = document.getElementById('summaryArea');

    const nextStep1Button = document.getElementById('nextStep1Button');
    const nextStep2Button = document.getElementById('nextStep2Button');
    const nextStep3Button = document.getElementById('nextStep3Button');
    const finishButton = document.getElementById('finishButton'); 
    const finalSubmitButton = document.getElementById('finalSubmitButton'); // ★新要素★

    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const step4 = document.getElementById('step-4'); 
    const step5 = document.getElementById('step-5'); 
    
    const aiFeedbackArea = document.getElementById('aiFeedbackArea');
    const aiFeedbackText = document.getElementById('aiFeedbackText');
    const aiSummaryText = document.getElementById('aiSummaryText'); 
    const hintSkillButton = document.getElementById('hintSkillButton');
    const hintRelationshipButton = document.getElementById('hintRelationshipButton');
    const hintLessonButton = document.getElementById('hintLessonButton');
    
    const goToTopButton = document.getElementById('goToTopButton');

    const showCognitiveDistortionHintButton = document.getElementById('showCognitiveDistortionHint');
    const cognitiveDistortionModal = document.getElementById('cognitiveDistortionModal');
    const closeCognitiveDistortionModalButton = document.getElementById('closeCognitiveDistortionModalButton');
    const closeCognitiveDistortionModalButton2 = document.getElementById('closeCognitiveDistortionModalButton2')

    const SERVER_BASE_URL = 'https://resilience-mentor-api.onrender.com'; 
    // --------------------------------------------------------------------------------

    const SERVER_URL_REFRAMING = `${SERVER_BASE_URL}/api/reframing`;
    const SERVER_URL_SUMMARY = `${SERVER_BASE_URL}/api/finish`;

    let currentRecord = {}; 
    
    const resourceMap = {
        skill: 'スキル',
        relationship: '人間関係',
        lesson: '人生の教訓'
    };
    
    // ------------------------------------
    // ユーティリティ関数：HTMLエスケープ
    // ------------------------------------
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, function(match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    // ------------------------------------
    // ユーティリティ関数：AIメンターへのリクエスト
    // ------------------------------------
    const getAdvice = async (resourceType, buttonElement) => {
        const fact = factTextarea.value.trim(); 
        const rootThought = rootThoughtTextarea.value.trim(); 
        
        const resourceNameJp = resourceMap[resourceType] || resourceType;

        if (fact === '' || rootThought === '') {
            alert("Step 1（事実の記録）と Step 2（思考のクセ）を完了してから、ヒントを求めてください。");
            return;
        }

        aiFeedbackText.innerHTML = `AIメンターが${resourceNameJp}のヒントを分析中です... しばらくお待ちください。`;
        aiFeedbackArea.style.display = 'block';
        buttonElement.disabled = true; 

        try {
            const response = await fetch(SERVER_URL_REFRAMING, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fact, rootThought, resourceType }), 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`サーバーエラー: ${response.status} - ${errorData.error || '不明なエラー'}`);
            }

            const data = await response.json();
            
            aiFeedbackText.innerHTML = `🤖 ${resourceNameJp}ヒント:<br>${data.advice.replace(/\n/g, '<br>')}`; 
            
        } catch (error) {
            console.error("AI通信エラー:", error);
            aiFeedbackText.innerHTML = `⚠️ エラーが発生しました。サーバーが起動しているか確認してください。(${error.message})`;
        } finally {
            buttonElement.disabled = false; 
        }
    };
    
    // ------------------------------------
    // 画面遷移とイベントリスナー
    // ------------------------------------
    nextStep1Button.addEventListener('click', () => {
        const factText = factTextarea.value.trim();
        if (factText === '') {
            alert('心が揺らいだ出来事を事実として記録してください。');
            return;
        }
        currentRecord.tempId = new Date().getTime(); 
        currentRecord.fact = factText;
        currentRecord.date = new Date().toISOString();
        
        if (step1 && step2) {
            step1.style.display = 'none';
            step2.style.display = 'block';
        }
    });

    nextStep2Button.addEventListener('click', () => {
        const emotionText = emotionTextarea.value.trim();
        const rootThoughtText = rootThoughtTextarea.value.trim();

        if (emotionText === '' || rootThoughtText === '') {
            alert('感情と根源の考え（思考のクセ）の両方を入力してください。');
            return;
        }
        
        currentRecord.emotion = emotionText;
        currentRecord.rootThought = rootThoughtText;

        if (step2 && step3) {
            step2.style.display = 'none';
            step3.style.display = 'block'; 
        }
        
        aiFeedbackArea.style.display = 'none'; 
    });

    // 3つの個別ヒントボタンのイベントリスナー
    if (hintSkillButton) {
        hintSkillButton.addEventListener('click', () => getAdvice('skill', hintSkillButton));
    }
    if (hintRelationshipButton) {
        hintRelationshipButton.addEventListener('click', () => getAdvice('relationship', hintRelationshipButton));
    }
    if (hintLessonButton) {
        hintLessonButton.addEventListener('click', () => getAdvice('lesson', hintLessonButton));
    }
    
    // ------------------------------------
    // STEP 3, 4, 5 ロジック
    // ------------------------------------
    const renderSummary = () => { 
        const summaryArea = document.getElementById('summaryArea');
        if (!summaryArea) return;

        // 運の評価の項目は削除されているため、関連する表示は削除
        let summaryHtml = `
            <h4 style="color: #3498db; border-bottom: 1px solid #ccc; padding-bottom: 5px;">STEP 1: 事実の記録</h4>
            <p style="padding-left: 10px; font-size: 15px;">${currentRecord.fact}</p>
            
            <h4 style="color: #e67e22; border-bottom: 1px solid #ccc; padding-top: 10px; padding-bottom: 5px;">STEP 2: 思考のクセ分析</h4>
            <p style="padding-left: 10px; font-size: 15px;"><strong>湧き出た感情:</strong> ${currentRecord.emotion}</p>
            <p style="padding-left: 10px; font-size: 15px;"><strong>根源にある考え（思考のクセ）:</strong> ${currentRecord.rootThought}</p>
            
            <h4 style="color: #27ae60; border-bottom: 1px solid #ccc; padding-top: 10px; padding-bottom: 5px;">STEP 3: 強みへの変換</h4>
        `;
        
        // 3つの回答を手動で追加 
        summaryHtml += `<div style="margin-bottom: 5px;">
            <p style="font-weight: bold; font-size: 15px; margin-bottom: 0;">スキルへの変換：</p>
            <p style="padding-left: 10px; border-left: 3px solid #27ae60; font-size: 15px; margin-top: 0;">${escapeHtml(currentRecord.skillAnswer).replace(/\n/g, '<br>')}</p>
        </div>`;
        summaryHtml += `<div style="margin-bottom: 5px;">
            <p style="font-weight: bold; font-size: 15px; margin-bottom: 0;">人間関係への変換：</p>
            <p style="padding-left: 10px; border-left: 3px solid #27ae60; font-size: 15px; margin-top: 0;">${escapeHtml(currentRecord.relationshipAnswer).replace(/\n/g, '<br>')}</p>
        </div>`;
        summaryHtml += `<div style="margin-bottom: 5px;">
            <p style="font-weight: bold; font-size: 15px; margin-bottom: 0;">教訓への変換：</p>
            <p style="padding-left: 10px; border-left: 3px solid #27ae60; font-size: 15px; margin-top: 0;">${escapeHtml(currentRecord.lessonAnswer).replace(/\n/g, '<br>')}</p>
        </div>`;
        
        // 運の評価項目は削除したため、関連する表示ロジックも削除
        // let luckyText = { ... };
        // summaryHtml += `<p style="font-weight: bold; font-size: 15px; margin-top: 10px;">4. 今回の出来事の運の評価: ... </p>`;

        summaryArea.innerHTML = summaryHtml;
    };


    nextStep3Button.addEventListener('click', () => {
        const skillAnswer = skillAnswerArea.value.trim();
        const relationshipAnswer = relationshipAnswerArea.value.trim();
        const lessonAnswer = lessonAnswerArea.value.trim();
        // const luckyAssessment = luckySelect.value; // 削除
        
        // 運の評価のチェックを削除
        if (skillAnswer === '' || relationshipAnswer === '' || lessonAnswer === '') {
            alert('3つの資源の質問をすべて完了してください。');
            return;
        }

        currentRecord.skillAnswer = skillAnswer;
        currentRecord.relationshipAnswer = relationshipAnswer;
        currentRecord.lessonAnswer = lessonAnswer;
        // currentRecord.luckyAssessment = luckyAssessment; // 削除

        renderSummary(); 
        
        if (step3 && step4) {
            step3.style.display = 'none';
            step4.style.display = 'block'; 
        }
        
        aiFeedbackArea.style.display = 'none';
    });
    
    // STEP 5: 総評ロジック (AI連携と最終保存)
    const generateSummaryAndFinish = async (finalRecord) => { 
        if (step4 && step5) {
            step4.style.display = 'none';
            step5.style.display = 'block';
        }

        try {
            // AI総評の生成リクエスト
            const response = await fetch(SERVER_URL_SUMMARY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ record: finalRecord }),
            });

            if (!response.ok) {
                throw new Error(`サーバーエラー: ${response.status}`);
            }

            const data = await response.json();
            const generatedSummary = data.summary;
            
            // AI総評を画面に表示
            aiSummaryText.innerHTML = generatedSummary.replace(/\n/g, '<br>');

            // ★AI総評の下に新しい質問フォームを追加★
            const questionHtml = `
                <div style="margin-top: 30px; text-align: left;">
                    <h4>思考変換によって、あなたは今日の出来事をどのように感じましたか？</h4>
                    <select id="thoughtAssessmentSelect" style="width: 100%; padding: 10px; border-radius: 8px;">
                        <option value="">選択してください</option>
                        <option value="bad_to_positive">運が悪いと思っていたが、少しポジティブになれた気がした</option>
                        <option value="bad_to_negative">運が悪いと思っていた、やはり辛いままだ</option>
                        <option value="neutral_to_positive">運とは関係ない出来事だった、少しポジティブになれた気がした</option>
                        <option value="neutral_to_neutral">運とは関係ない出来事だった、特に何も感じなかった</option>
                        <option value="neutral_to_negative">運とは関係ない出来事だった、やはり辛いままだ</option>
                        <option value="good_to_more_positive">運が良かった出来事だった、さらにポジティブになれた気がした</option>
                        <option value="good_to_anxious">運が良かった出来事だったが、この先悪いことが起きるのではないかと不安だ</option>
                    </select>
                </div>
                <button class="button-primary" id="finalSubmitButton" style="background-color: #27ae60; border-color: #27ae60; margin-top: 25px;">記録を完了し、トップに戻る</button>
            `;
            document.getElementById('summaryDisplay').insertAdjacentHTML('beforeend', questionHtml);
            
            // ★最終送信ボタンのリスナーを設定★
            document.getElementById('finalSubmitButton').addEventListener('click', () => {
                const thoughtAssessment = document.getElementById('thoughtAssessmentSelect').value;
                if (thoughtAssessment === '') {
                    alert('最終的な感情の評価を選択してください。');
                    return;
                }
                
                // 最終レコードを構築 (AI総評と最終評価を追加)
                finalRecord.summary = generatedSummary; // AI総評を追加
                finalRecord.thoughtAssessment = thoughtAssessment; // 最終評価を追加

                // 2. 共通関数を使ってLocalStorageに保存 (UserIdが付与される)
                const isSaved = saveRecord(finalRecord); // ★★★ 記録保存 ★★★
                
                if (isSaved) {
                    alert('思考変換トレーニングの記録が完了しました！');
                    window.location.href = 'index.html'; // トップ画面へ遷移
                } else {
                    alert('記録の最終保存に失敗しました。');
                }
            });


        } catch (error) {
            console.error("AI総評エラー:", error);
            aiSummaryText.innerHTML = `⚠️ 総評の生成中にエラーが発生しました。サーバー（Node.js）で詳細を確認してください。`;
        }
    };


    // STEP 4: 最終確認とAI総評生成へ
    if (finishButton) {
        finishButton.addEventListener('click', () => {
            try {
                // 1. 永続保存のための finalRecord 構築 (AI総評追記のために必要なフィールドのみ)
                const finalRecord = {
                    tempId: currentRecord.tempId, // AI総評追記のための仮ID
                    type: 'mindRecord', 
                    date: currentRecord.date,
                    fact: currentRecord.fact,
                    emotion: currentRecord.emotion,
                    rootThought: currentRecord.rootThought,
                    answers: [ 
                        { type: 'skill', answer: currentRecord.skillAnswer },
                        { type: 'relation', answer: currentRecord.relationshipAnswer }, 
                        { type: 'lesson', answer: currentRecord.lessonAnswer }
                    ],
                    // luckyAssessment: currentRecord.luckyAssessment // 削除済み
                };

                // AI総評の生成と表示へ移行
                generateSummaryAndFinish(finalRecord);
                
                // currentRecordはクリアせず、最終保存時に利用

            } catch (error) {
                console.error("データの保存中に致命的なエラーが発生しました:", error);
                alert('致命的なエラーが発生しました。記録は保存されていません。F12キーでコンソールを確認してください。');
            }
        });
        
    }

   // ------------------------------------
// 💡 トレーニング説明機能の追加 (モーダル方式に修正)
// ------------------------------------
const showInstructionButton = document.getElementById('showInstructionButton');
const instructionModal = document.getElementById('instructionModal');
const closeModalButton = document.getElementById('closeModalButton');

if (showInstructionButton) {
    // 「トレーニングの目的と使い方」ボタンが押されたとき
    showInstructionButton.addEventListener('click', () => {
        instructionModal.style.display = 'block';
    });
}

if (closeModalButton) {
    // 閉じるボタン（×）が押されたとき
    closeModalButton.addEventListener('click', () => {
        instructionModal.style.display = 'none';
    });
}

// モーダルの外側をクリックしても閉じるようにする
window.addEventListener('click', (event) => {
    if (event.target === instructionModal) {
        instructionModal.style.display = 'none';
    }
});


// ------------------------------------
// 🤔 思考のクセ ヒント機能の追加
// ------------------------------------
const closeCognitiveDistortionModal = () => {
    cognitiveDistortionModal.style.display = 'none';
};

// 1. ヒントボタンが押されたとき (★この if 文で囲われているか確認★)
if (showCognitiveDistortionHintButton) {
    showCognitiveDistortionHintButton.addEventListener('click', () => {
        if (cognitiveDistortionModal) { 
            cognitiveDistortionModal.style.display = 'block';
        } else {
            console.error("エラー: cognitiveDistortionModal 要素が見つかりません。HTML IDを確認してください。");
        }
    });
}

if (closeCognitiveDistortionModalButton) {
    closeCognitiveDistortionModalButton.addEventListener('click', closeCognitiveDistortionModal);
}
if (closeCognitiveDistortionModalButton2) {
    closeCognitiveDistortionModalButton2.addEventListener('click', closeCognitiveDistortionModal);
}

// モーダルの外側をクリックしても閉じるようにする
window.addEventListener('click', (event) => {
    if (event.target === instructionModal) {
        instructionModal.style.display = 'none';
    }
    // ★思考のクセモーダルにも追加★
    if (event.target === cognitiveDistortionModal) {
        cognitiveDistortionModal.style.display = 'none';
    }
});


    // STEP 5: トップに戻るボタン（旧ボタン）は非表示
    if (goToTopButton) {
        goToTopButton.addEventListener('click', () => {
            window.location.href = 'index.html'; 
        });
    }
});