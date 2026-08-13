(function() {
    ['contextmenu', 'selectstart', 'dragstart'].forEach(eventType => {
        document.addEventListener(eventType, function(e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            return true;
        }, true);
    });

    document.oncontextmenu = null;
    window.oncontextmenu = null;

    const oldPanel = document.getElementById('macro-panel');
    if (oldPanel) oldPanel.remove();
    const oldHud = document.getElementById('macro-gold-hud');
    if (oldHud) oldHud.remove();
    const oldNotif = document.getElementById('macro-notification');
    if (oldNotif) oldNotif.remove();
    const oldModal = document.getElementById('macro-acc-modal');
    if (oldModal) oldModal.remove();
    const oldDelModal = document.getElementById('macro-del-modal');
    if (oldDelModal) oldDelModal.remove();
    const oldConfirm = document.getElementById('macro-confirm-modal');
    if (oldConfirm) oldConfirm.remove();
    const oldHighlightStyle = document.getElementById('macro-highlight-style');
    if (oldHighlightStyle) oldHighlightStyle.remove();
    const oldStyle = document.getElementById('macro-panel-style');
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = 'macro-panel-style';
    style.innerHTML = `
        #macro-panel {
            position: fixed;
            left: 20px;
            top: 300px;
            z-index: 999999;
            background: rgba(10, 10, 10, 0.9);
            backdrop-filter: blur(3px);
            border: 1.5px solid rgba(236, 72, 153, 0.6);
            border-radius: 4px;
            padding: 4px;
            font-family: sans-serif;
            color: #ffffff;
            width: 110px;
            min-width: 50px;
            min-height: unset;
            height: auto;
            resize: both;
            overflow: auto;
            user-select: none;
            box-shadow: 0 3px 8px rgba(0,0,0,0.8);
            font-size: 9px;
        }
        #macro-panel::-webkit-resizer {
            background-color: rgba(236, 72, 153, 0.5);
            border-radius: 2px;
        }
        /* Minimize olunca sadece makrolar gizlenir, hesaplar hep görünür */
        #macro-panel.minimized #macro-macros-wrapper {
            display: none !important;
        }
        #macro-panel .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            padding-bottom: 2px;
            margin-bottom: 2px;
            cursor: move;
        }
        #macro-panel h4 {
            margin: 0;
            font-size: 8px;
            color: #ec4899;
            letter-spacing: 0.2px;
        }
        #close-panel-btn {
            background: rgba(239, 68, 68, 0.3);
            border: 1px solid rgba(239, 68, 68, 0.6);
            color: #ff8080;
            cursor: pointer;
            font-size: 7px;
            font-weight: bold;
            padding: 0px 2px;
            border-radius: 2px;
        }
        #close-panel-btn:hover { background: rgba(239, 68, 68, 0.6); color: #fff; }
        .macro-btn-status {
            display: flex; justify-content: space-between; align-items: center;
            background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 2px; padding: 2px; margin-bottom: 2px;
            font-size: 8px;
        }
        .macro-btn-status span.indicator { width: 3px; height: 3px; border-radius: 50%; background: #ef4444; }
        .macro-btn-status.active { border-color: rgba(34, 197, 94, 0.8); background: rgba(20, 83, 45, 0.5); }
        .macro-btn-status.active span.indicator { background: #22c55e; }
        .key-bind-btn {
            background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.25);
            color: #ffd700; padding: 0px 3px; border-radius: 2px; cursor: pointer; font-size: 9px; font-weight: bold;
        }
        .panel-actions { display: flex; gap: 2px; margin-top: 2px; }
        .panel-btn-action {
            flex: 1; background: rgba(0, 150, 255, 0.25); border: 1px solid rgba(0, 150, 255, 0.5);
            color: #fff; padding: 1px; border-radius: 2px; cursor: pointer; font-size: 8px; font-weight: bold; text-align: center;
        }
        .speed-control { margin-top: 2px; padding-top: 2px; border-top: 1px dashed rgba(255,255,255,0.2); color: #ddd; font-size: 8px; }
        .speed-control input { width: 100%; cursor: pointer; margin-top: 1px; height: 3px; }
        
        .account-section { margin-top: 2px; padding-top: 2px; font-size: 8px; color: #ec4899; }
        .account-select { width: 100%; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid rgba(236,72,153,0.6); font-size: 8px; border-radius: 2px; margin-top: 1px; padding: 2px; }
        .account-actions { display: flex; gap: 2px; margin-top: 2px; }
        .account-btn {
            flex: 1; background: rgba(236, 72, 153, 0.25); border: 1px solid rgba(236, 72, 153, 0.6);
            color: #fff; padding: 1px; border-radius: 2px; cursor: pointer; font-size: 7px; font-weight: bold; text-align: center;
        }
        .account-btn:hover { background: rgba(236, 72, 153, 0.5); }
        .account-btn-del {
            background: rgba(239, 68, 68, 0.25); border: 1px solid rgba(239, 68, 68, 0.6);
            color: #ff8080;
        }
        .account-btn-del:hover { background: rgba(239, 68, 68, 0.5); color: #fff; }

        #macro-acc-modal, #macro-del-modal {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999999;
            background: rgba(15, 15, 15, 0.95); border: 1.5px solid #ec4899; color: #fff;
            padding: 10px; border-radius: 4px; font-family: sans-serif; font-size: 9px; width: 150px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.9); display: none;
        }
        #macro-acc-modal h5, #macro-del-modal h5 { margin: 0 0 5px 0; color: #ec4899; font-size: 9px; text-align: center; }
        #macro-acc-modal input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 8px; padding: 2px; margin-bottom: 4px; border-radius: 2px; box-sizing: border-box; }
        
        .del-list { max-height: 100px; overflow-y: auto; margin-bottom: 5px; display: flex; flex-direction: column; gap: 2px; }
        .del-item { background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); color: #fff; padding: 3px; font-size: 8px; border-radius: 2px; cursor: pointer; text-align: left; }
        .del-item:hover { background: rgba(239, 68, 68, 0.5); }

        .modal-btns { display: flex; gap: 3px; }
        .modal-btn { flex: 1; padding: 2px; font-size: 8px; font-weight: bold; border-radius: 2px; cursor: pointer; border: none; }
        #modal-save { background: rgba(34, 197, 94, 0.4); color: #fff; border: 1px solid #22c55e; }
        #modal-cancel, #del-modal-cancel { background: rgba(239, 68, 68, 0.4); color: #fff; border: 1px solid #ef4444; }

        #macro-confirm-modal {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999999;
            background: rgba(15, 15, 15, 0.95); border: 1.5px solid #ec4899; color: #fff;
            padding: 10px; border-radius: 4px; font-family: sans-serif; font-size: 9px; width: 160px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.9); text-align: center; display: none;
        }
        #macro-confirm-modal p { margin: 0 0 8px 0; color: #ec4899; font-weight: bold; line-height: 1.2; }
        .confirm-btns { display: flex; gap: 4px; justify-content: center; }
        .confirm-btn-yes { background: rgba(34, 197, 94, 0.4); color: #fff; border: 1px solid #22c55e; padding: 3px 8px; border-radius: 2px; cursor: pointer; font-weight: bold; }
        .confirm-btn-no { background: rgba(239, 68, 68, 0.4); color: #fff; border: 1px solid #ef4444; padding: 3px 8px; border-radius: 2px; cursor: pointer; font-weight: bold; }

        #macro-gold-hud {
            position: fixed;
            left: 10px;
            top: 32%;
            z-index: 9999999;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(2px);
            border: 1.5px solid rgba(236, 72, 153, 0.6);
            border-radius: 4px;
            padding: 6px 10px;
            font-family: sans-serif;
            color: #ec4899;
            font-size: 13px;
            font-weight: bold;
            pointer-events: none;
            box-shadow: 0 3px 8px rgba(0,0,0,0.7);
            letter-spacing: 0.5px;
        }

        #macro-notification {
            position: fixed; top: 15px; left: 50%; transform: translateX(-50%); z-index: 9999999;
            background: rgba(0, 0, 0, 0.8); border: 1px solid rgba(236, 72, 153, 0.4); color: #ec4899;
            padding: 5px 12px; border-radius: 20px; font-family: sans-serif; font-size: 10px; font-weight: bold;
            pointer-events: none; transition: opacity 0.3s ease; opacity: 0;
        }
    `;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.id = 'macro-panel';
    panel.className = 'minimized'; // Başlangıçta minimize başlar
    panel.innerHTML = `
        <div class="panel-header" id="panel-drag-handle">
            <h4>MAKROLAR PANELİ</h4>
            <button id="close-panel-btn">+</button>
        </div>
        <div id="panel-content">
            <div id="macro-macros-wrapper">
                <div id="stat-respawn" class="macro-btn-status"><span>Oto doğma: <button class="key-bind-btn" data-action="respawn" id="key-respawn">B</button></span><span class="indicator"></span></div>
                <div id="stat-space" class="macro-btn-status"><span>Oto Sp: <button class="key-bind-btn" data-action="space" id="key-space">N</button></span><span class="indicator"></span></div>
                <div id="stat-x" class="macro-btn-status"><span>Oto gold: <button class="key-bind-btn" data-action="x" id="key-x">M</button></span><span class="indicator"></span></div>
                <div id="stat-master" class="macro-btn-status"><span>Bas Dol: <button class="key-bind-btn" data-action="master" id="key-master">Ç</button></span><span class="indicator"></span></div>
                <div class="macro-btn-status" style="margin-top: 2px; border-top: 1px dashed rgba(255,255,255,0.2);"><span>Durdur: <button class="key-bind-btn" data-action="stop" id="key-stop">Shift</button></span></div>
                
                <div class="panel-actions"><button class="panel-btn-action" id="edit-keys-btn">Tuş Değiş</button><button class="panel-btn-action" id="save-keys-btn" style="background: rgba(34, 197, 94, 0.25); display: none;">Kaydet</button></div>

                <div class="speed-control"><span>Makro hızı: <strong id="speed-val">1.0x</strong></span><input type="range" id="speed-slider" min="0.2" max="2.5" step="0.1" value="1.0"></div>
            </div>

            <div class="account-section">
                <span>Hesap Seç:</span>
                <select id="account-select" class="account-select">
                    <option value="">Hesap Seç...</option>
                </select>
                <div class="account-actions">
                    <button class="account-btn" id="open-modal-btn">Hesap Ekle</button>
                    <button class="account-btn account-btn-del" id="open-del-modal-btn">Hesap Sil</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    const modal = document.createElement('div');
    modal.id = 'macro-acc-modal';
    modal.innerHTML = `
        <h5>Yeni Hesap Ekle</h5>
        <input type="text" id="modal-email" placeholder="E-posta / Kullanıcı Adı">
        <input type="password" id="modal-pass" placeholder="Şifre">
        <div class="modal-btns">
            <button class="modal-btn" id="modal-save">Kaydet</button>
            <button class="modal-btn" id="modal-cancel">İptal</button>
        </div>
    `;
    document.body.appendChild(modal);

    const delModal = document.createElement('div');
    delModal.id = 'macro-del-modal';
    delModal.innerHTML = `
        <h5>Hesap Sil</h5>
        <div id="del-account-list" class="del-list"></div>
        <button class="modal-btn" id="del-modal-cancel">Kapat</button>
    `;
    document.body.appendChild(delModal);

    const confirmModal = document.createElement('div');
    confirmModal.id = 'macro-confirm-modal';
    confirmModal.innerHTML = `
        <p id="confirm-text">ÖNCE HESAPTAN ÇIKIŞ YAP SONRA TAMAM TUŞUNA BAS </p>
        <div class="confirm-btns">
            <button class="confirm-btn-yes" id="confirm-yes">Evet</button>
            <button class="confirm-btn-no" id="confirm-no">İptal</button>
        </div>
    `;
    document.body.appendChild(confirmModal);

    let secilenGeciciUser = "";

    document.getElementById('open-modal-btn').onclick = () => {
        document.getElementById('modal-email').value = '';
        document.getElementById('modal-pass').value = '';
        modal.style.display = 'block';
    };

    document.getElementById('modal-cancel').onclick = () => {
        modal.style.display = 'none';
    };

    document.getElementById('modal-save').onclick = () => {
        let email = document.getElementById('modal-email').value.trim();
        let pass = document.getElementById('modal-pass').value.trim();

        if (email && pass) {
            let kayitliHesaplar = JSON.parse(localStorage.getItem('macro_manuel_hesaplar') || '{}');
            kayitliHesaplar[email] = pass;
            localStorage.setItem('macro_manuel_hesaplar', JSON.stringify(kayitliHesaplar));
            
            hesaplariListele();
            modal.style.display = 'none';
            gosterBildirim(email + " eklendi!", true);
        } else {
            gosterBildirim("Boş bırakılamaz!", false);
        }
    };

    document.getElementById('open-del-modal-btn').onclick = () => {
        let listContainer = document.getElementById('del-account-list');
        listContainer.innerHTML = '';
        let kayitliHesaplar = JSON.parse(localStorage.getItem('macro_manuel_hesaplar') || '{}');
        let keys = Object.keys(kayitliHesaplar);

        if (keys.length === 0) {
            listContainer.innerHTML = '<div style="font-size:8px; text-align:center; color:#888;">Kayıtlı hesap yok</div>';
        } else {
            keys.forEach(user => {
                let btn = document.createElement('button');
                btn.className = 'del-item';
                btn.innerText = user;
                btn.onclick = () => {
                    delete kayitliHesaplar[user];
                    localStorage.setItem('macro_manuel_hesaplar', JSON.stringify(kayitliHesaplar));
                    hesaplariListele();
                    delModal.style.display = 'none';
                    gosterBildirim(user + " silindi!", false);
                };
                listContainer.appendChild(btn);
            });
        }
        delModal.style.display = 'block';
    };

    document.getElementById('del-modal-cancel').onclick = () => {
        delModal.style.display = 'none';
    };

    function hesaplariListele() {
        let select = document.getElementById('account-select');
        if (!select) return;
        
        let kayitliHesaplar = JSON.parse(localStorage.getItem('macro_manuel_hesaplar') || '{}');
        let seciliOlan = select.value;
        
        select.innerHTML = '<option value="">Hesap Seç...</option>';
        for (let user in kayitliHesaplar) {
            let opt = document.createElement('option');
            opt.value = user;
            opt.innerText = user;
            if (user === seciliOlan) opt.selected = true;
            select.appendChild(opt);
        }
    }

    setTimeout(hesaplariListele, 500);

    document.getElementById('account-select').onchange = (e) => {
        let secilenUser = e.target.value;
        if (!secilenUser) return;
        
        secilenGeciciUser = secilenUser;
        confirmModal.style.display = 'block';
        e.target.value = "";
    };

    document.getElementById('confirm-no').onclick = () => {
        confirmModal.style.display = 'none';
        secilenGeciciUser = "";
    };

    document.getElementById('confirm-yes').onclick = () => {
        confirmModal.style.display = 'none';
        let user = secilenGeciciUser;
        let kayitliHesaplar = JSON.parse(localStorage.getItem('macro_manuel_hesaplar') || '{}');
        let pass = kayitliHesaplar[user];

        if (user && pass) {
            let butonlar = document.querySelectorAll('button, div, span');
            for (let b of butonlar) {
                let txt = b.innerText ? b.innerText.trim().toLowerCase() : '';
                if ((txt.includes('çıkış') || txt.includes('logout') || txt.includes('exit') || txt.includes('çık')) && b.offsetParent !== null) {
                    b.click();
                    break;
                }
            }

            setTimeout(() => {
                let textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input:not([type])');
                let passInputs = document.querySelectorAll('input[type="password"]');

                let targetInput = null;
                for (let input of textInputs) {
                    let ph = (input.placeholder || '').toLowerCase();
                    let name = (input.name || '').toLowerCase();
                    let id = (input.id || '').toLowerCase();
                    if (ph.includes('mail') || ph.includes('eposta') || ph.includes('posta') || name.includes('mail') || name.includes('email') || id.includes('mail') || id.includes('email')) {
                        targetInput = input;
                        break;
                    }
                }

                if (!targetInput && textInputs.length > 0) {
                    targetInput = textInputs[textInputs.length > 1 ? 1 : 0];
                }

                if (targetInput && passInputs.length > 0) {
                    targetInput.value = user;
                    targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                    targetInput.dispatchEvent(new Event('change', { bubbles: true }));

                    passInputs[0].value = pass;
                    passInputs[0].dispatchEvent(new Event('input', { bubbles: true }));
                    passInputs[0].dispatchEvent(new Event('change', { bubbles: true }));

                    gosterBildirim(user + " ile giriş yapılıyor...", true);

                    setTimeout(() => {
                        let btnList = document.querySelectorAll('button, div, span');
                        for (let b of btnList) {
                            let t = b.innerText ? b.innerText.trim().toLowerCase() : '';
                            if ((t === 'giriş yap' || t === 'login' || t === 'giriş') && b.offsetParent !== null) {
                                b.click();
                                break;
                            }
                        }
                    }, 400);
                } else {
                    gosterBildirim("Lütfen giriş ekranına gel!", false);
                }
            }, 600);
        }
        secilenGeciciUser = "";
    };

    let isDragging = false, startX, startY, initialLeft, initialTop;
    const dragHandle = document.getElementById('panel-drag-handle');

    dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = panel.offsetLeft;
        initialTop = panel.offsetTop;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let dx = e.clientX - startX;
        let dy = e.clientY - startY;
        panel.style.left = (initialLeft + dx) + 'px';
        panel.style.top = (initialTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    const goldHud = document.createElement('div');
    goldHud.id = 'macro-gold-hud';
    goldHud.innerHTML = `Harcanan Gold: <span id="hud-gold-val">0</span>`;
    document.body.appendChild(goldHud);

    const notifBox = document.createElement('div');
    notifBox.id = 'macro-notification';
    document.body.appendChild(notifBox);

    let notifTimer;
    function gosterBildirim(m, a) {
        notifBox.innerText = m; notifBox.style.borderColor = a ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)';
        notifBox.style.color = a ? '#22c55e' : '#ec4899'; notifBox.style.opacity = '1';
        clearTimeout(notifTimer); notifTimer = setTimeout(() => notifBox.style.opacity = '0', 1500);
    }

    let autoResp = false, autoSpace = false, autoX = false, master = false, speed = 1.0;
    
    if (typeof window.toplamHarcananGold === 'undefined') {
        window.toplamHarcananGold = 0;
    }

    let keys = { respawn: 'b', space: 'n', x: 'm', master: 'ç', stop: 'shift' };
    let isEdit = false, waitKey = null, tempKeys = { ...keys };
    let xT, sT, rT, oT;
    let zBasili = false, xBasili = false, zInterval = null, xInterval = null;

    document.getElementById('hud-gold-val').innerText = window.toplamHarcananGold.toLocaleString();

    document.getElementById('close-panel-btn').onclick = () => {
        panel.classList.toggle('minimized');
        let isMin = panel.classList.contains('minimized');
        document.getElementById('close-panel-btn').innerText = isMin ? '+' : '-';
    };

    document.getElementById('edit-keys-btn').onclick = () => {
        isEdit = true; tempKeys = { ...keys };
        document.getElementById('edit-keys-btn').style.display = 'none';
        document.getElementById('save-keys-btn').style.display = 'block';
        document.querySelectorAll('.key-bind-btn').forEach(b => b.style.borderColor = '#ec4899');
        gosterBildirim("Tuş Değiştirme Modu", true);
    };

    document.querySelectorAll('.key-bind-btn').forEach(b => {
        b.onclick = (e) => {
            if (!isEdit) return;
            waitKey = e.target.getAttribute('data-action');
            e.target.innerText = '...';
        };
    });

    document.getElementById('save-keys-btn').onclick = () => {
        keys = { ...tempKeys }; isEdit = false; waitKey = null;
        document.getElementById('save-keys-btn').style.display = 'none';
        document.getElementById('edit-keys-btn').style.display = 'block';

        document.querySelectorAll('.key-bind-btn').forEach(btn => {
            btn.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            const action = btn.getAttribute('data-action');
            btn.innerText = keys[action].toUpperCase();
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        gosterBildirim("Tuşlar Kaydedildi!", true);
    };

    document.getElementById('speed-slider').oninput = (e) => {
        speed = parseFloat(e.target.value);
        document.getElementById('speed-val').innerText = speed.toFixed(1) + 'x';
    };

    function updateUI() {
        document.getElementById('stat-respawn').className = `macro-btn-status ${autoResp ? 'active' : ''}`;
        document.getElementById('stat-space').className = `macro-btn-status ${autoSpace ? 'active' : ''}`;
        document.getElementById('stat-x').className = `macro-btn-status ${autoX ? 'active' : ''}`;
        document.getElementById('stat-master').className = `macro-btn-status ${master ? 'active' : ''}`;
    }

    function oyundaMi() {
        let canvas = document.querySelector('canvas');
        if (!canvas || canvas.offsetParent === null) return false;
        
        let butonlar = document.querySelectorAll('button, div, span');
        for (let b of butonlar) {
            let txt = b.innerText ? b.innerText.trim().toLowerCase() : '';
            if ((txt === 'oyna' || txt.includes('yeniden bağlan') || txt.includes('reconnect')) && b.offsetParent !== null) {
                return false;
            }
        }
        return true;
    }

    function tusGonder(t) {
        if (!oyundaMi()) return;
        let canvas = document.querySelector('canvas') || window;
        let v = t === ' ' ? 32 : t.charCodeAt(0);
        let codeStr = t === ' ' ? 'Space' : ('Key' + t.toUpperCase());

        let d = new KeyboardEvent('keydown', { key: t, code: codeStr, keyCode: v, which: v, bubbles: true, cancelable: true, isTrusted: true });
        let u = new KeyboardEvent('keyup', { key: t, code: codeStr, keyCode: v, which: v, bubbles: true, cancelable: true, isTrusted: true });

        canvas.dispatchEvent(d);
        setTimeout(() => canvas.dispatchEvent(u), 15);
    }

    function oyna() {
        let butonlar = document.querySelectorAll('button, div, span');
        for (let b of butonlar) {
            let txt = b.innerText ? b.innerText.trim().toLowerCase() : '';
            if ((txt === 'oyna' || txt.includes('yeniden bağlan') || txt.includes('reconnect')) && b.offsetParent !== null) {
                b.click();
                break;
            }
        }
    }

    function goldEkle(miktar) {
        if (!oyundaMi()) return;
        window.toplamHarcananGold += miktar;
        let hudEl = document.getElementById('hud-gold-val');
        if (hudEl) hudEl.innerText = window.toplamHarcananGold.toLocaleString();
    }

    function spaceLoop() {
        if (!oyundaMi() || (!autoSpace && !master)) return;
        tusGonder(' ');
        let delay = (Math.floor(Math.random() * 50) + 70) / speed;
        sT = setTimeout(spaceLoop, Math.max(40, delay));
    }

    function xLoop() {
        if (!oyundaMi() || (!autoX && !master)) return;
        tusGonder('x');
        goldEkle(500);
        let delay = (Math.floor(Math.random() * 45) + 125) / speed;
        xT = setTimeout(xLoop, Math.max(90, delay));
    }

    function respawnLoop() {
        if (!oyundaMi() || (!autoResp && !master)) return;
        oyna();
        rT = setTimeout(respawnLoop, 2000 / speed);
    }

    function stopAll() {
        autoResp = autoSpace = autoX = master = false;
        clearTimeout(xT); clearTimeout(sT); clearTimeout(rT); clearTimeout(oT);
        clearInterval(zInterval); clearInterval(xInterval);
        zBasili = xBasili = false;
        updateUI(); gosterBildirim("Makro Durduruldu", false);
    }

    document.addEventListener('keydown', e => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

        let k = e.key.toLowerCase();

        if (isEdit && waitKey) {
            tempKeys[waitKey] = k;
            document.getElementById(`key-${waitKey}`).innerText = k.toUpperCase();
            waitKey = null;
            return;
        }
        if (isEdit) return;

        if (!oyundaMi() && k !== keys.stop && e.key !== 'Shift') return;

        if (k === 'z') {
            if (!zBasili && oyundaMi()) {
                zBasili = true;
                goldEkle(30);
                zInterval = setInterval(() => goldEkle(30), 120);
            }
            return;
        }

        if (k === 'x' || k === keys.x) {
            if (!xBasili && oyundaMi()) {
                xBasili = true;
                goldEkle(500);
                xInterval = setInterval(() => goldEkle(500), 120);
            }
        }

        if (k === keys.stop || e.key === 'Shift') { stopAll(); return; }

        if (k === keys.respawn) {
            autoResp = !autoResp;
            autoResp ? (respawnLoop(), oT = setInterval(oyna, 1500)) : (clearTimeout(rT), clearInterval(oT));
            gosterBildirim("Oto doğma: " + (autoResp ? "Devrede" : "Kapalı"), autoResp);
            updateUI();
        }
        if (k === keys.space) {
            autoSpace = !autoSpace;
            autoSpace ? spaceLoop() : clearTimeout(sT);
            gosterBildirim("Oto Sp: " + (autoSpace ? "Devrede" : "Kapalı"), autoSpace);
            updateUI();
        }
        if (k === keys.x && k !== keys.stop) {
            autoX = !autoX;
            autoX ? xLoop() : clearTimeout(xT);
            gosterBildirim("Oto gold: " + (autoX ? "Devrede" : "Kapalı"), autoX);
            updateUI();
        }
        if (k === keys.master) {
            master = !master;
            master ? (autoResp = autoSpace = autoX = true, oyna(), xLoop(), spaceLoop(), respawnLoop(), oT = setInterval(oyna, 1500)) : stopAll();
            gosterBildirim("Bas Dol: " + (master ? "Devrede" : "Kapalı"), master);
            updateUI();
        }
    });

    document.addEventListener('keyup', e => {
        let k = e.key.toLowerCase();
        if (k === 'z') {
            zBasili = false;
            clearInterval(zInterval);
        }
        if (k === 'x' || k === keys.x) {
            xBasili = false;
            clearInterval(xInterval);
        }
    });
})();