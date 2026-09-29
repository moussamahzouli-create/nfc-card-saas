import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MerchantLoginPage() {
  // If already authenticated, redirect to merchant dashboard
  const cookieStore = await cookies();
  const merchantSession = cookieStore.get('merchant_session');
  
  if (merchantSession?.value) {
    redirect('/merchant');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              B
            </div>
            <div>
              <div className="text-white font-bold text-xl">BRAND XPER</div>
              <div className="text-purple-300 text-sm">Espace Commerçant</div>
            </div>
          </div>
          <p className="text-purple-200 text-sm">Connectez-vous à votre tableau de bord privé</p>
        </div>

        {/* Login form rendered client-side */}
        <div id="merchant-login-root" 
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl"
          data-component="merchant-login"
        >
          <div className="text-center text-purple-200 py-8">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Chargement...
          </div>
        </div>

        <p className="text-center text-purple-400 text-xs mt-6">
          Zone sécurisée réservée aux commerçants • Brand Xper
        </p>
      </div>

      {/* Client-side login form injected via script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const root = document.getElementById('merchant-login-root');
          
          let pin = '';
          let submitting = false;

          function renderKeypad() {
            root.innerHTML = \`
              <div class="text-center mb-6">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h2 class="text-white font-bold text-xl mb-1">Code d'accès</h2>
                <p class="text-purple-300 text-sm">Entrez votre code PIN commerçant</p>
              </div>

              <div class="flex justify-center gap-3 mb-6" id="pin-dots">
                \${[0,1,2,3].map(i => \`<div class="w-4 h-4 rounded-full border-2 border-purple-400 bg-transparent transition-all duration-200 dot" id="dot-\${i}"></div>\`).join('')}
              </div>

              <div id="pin-error" class="hidden mb-4 text-center">
                <p class="text-red-300 text-sm bg-red-900/30 rounded-xl py-2 px-4">Code PIN incorrect. Réessayez.</p>
              </div>

              <div id="keypad" class="grid grid-cols-3 gap-3 mb-4">
                \${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => {
                  if (k === '') return \`<div></div>\`;
                  return \`<button onclick="handleKey('\${k}')" class="bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white rounded-2xl h-14 text-xl font-semibold transition-all duration-150 keypad-btn" data-key="\${k}">\${k}</button>\`;
                }).join('')}
              </div>

              <div id="submitting-state" class="hidden text-center py-4">
                <div class="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-purple-300 text-sm">Vérification...</p>
              </div>
            \`;
            updateDots();
          }

          function updateDots() {
            for (let i = 0; i < 4; i++) {
              const dot = document.getElementById('dot-' + i);
              if (dot) {
                if (i < pin.length) {
                  dot.style.background = '#a855f7';
                  dot.style.borderColor = '#a855f7';
                  dot.style.transform = 'scale(1.2)';
                } else {
                  dot.style.background = 'transparent';
                  dot.style.borderColor = '#9333ea';
                  dot.style.transform = 'scale(1)';
                }
              }
            }
          }

          window.handleKey = function(k) {
            if (submitting) return;
            const errEl = document.getElementById('pin-error');
            if (errEl) errEl.classList.add('hidden');

            if (k === '⌫') {
              pin = pin.slice(0, -1);
            } else if (pin.length < 4) {
              pin = pin + k.toString();
            }

            updateDots();

            if (pin.length === 4) {
              submitPin();
            }
          };

          async function submitPin() {
            if (submitting) return;
            submitting = true;

            const keypad = document.getElementById('keypad');
            const submittingState = document.getElementById('submitting-state');
            if (keypad) keypad.style.opacity = '0.4';
            if (submittingState) submittingState.classList.remove('hidden');

            try {
              // We need slug — try to detect from URL or stored value
              // For the /merchant/login page we need slug in URL query
              const urlParams = new URLSearchParams(window.location.search);
              const slug = urlParams.get('store');

              if (!slug) {
                // Show slug input instead
                showSlugInput();
                return;
              }

              const res = await fetch('/api/merchant/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, pin }),
              });

              const json = await res.json();

              if (res.ok && json.success) {
                window.location.href = '/merchant/' + json.slug;
              } else {
                const errEl = document.getElementById('pin-error');
                if (errEl) errEl.classList.remove('hidden');
                pin = '';
                submitting = false;
                if (keypad) keypad.style.opacity = '1';
                if (submittingState) submittingState.classList.add('hidden');
                updateDots();
              }
            } catch (e) {
              console.error(e);
              submitting = false;
              if (keypad) { keypad.style.opacity = '1'; }
              const submittingState = document.getElementById('submitting-state');
              if (submittingState) submittingState.classList.add('hidden');
              pin = '';
              updateDots();
            }
          }

          function showSlugInput() {
            submitting = false;
            pin = '';
            root.innerHTML = \`
              <div class="text-center mb-6">
                <h2 class="text-white font-bold text-xl mb-1">Identifiant du magasin</h2>
                <p class="text-purple-300 text-sm">Entrez l'identifiant de votre magasin</p>
              </div>
              <input 
                id="slug-input"
                type="text" 
                placeholder="ex: cafe-nasro"
                class="w-full bg-white/10 border border-white/30 text-white placeholder-purple-400 rounded-2xl px-4 py-3 mb-4 text-center text-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30"
              />
              <button 
                onclick="handleSlugSubmit()"
                class="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-2xl py-3 transition-all duration-200"
              >
                Continuer →
              </button>
            \`;

            const input = document.getElementById('slug-input');
            if (input) {
              input.focus();
              input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSlugSubmit();
              });
            }
          }

          window.handleSlugSubmit = function() {
            const slugInput = document.getElementById('slug-input');
            const slug = slugInput ? slugInput.value.trim().toLowerCase() : '';
            if (!slug) return;
            window.location.href = '/merchant/login?store=' + encodeURIComponent(slug);
          };

          // Check if store param exists in URL
          const urlParams = new URLSearchParams(window.location.search);
          const storeParam = urlParams.get('store');

          if (storeParam) {
            renderKeypad();
          } else {
            showSlugInput();
          }
        })();
      `}} />
    </div>
  );
}
