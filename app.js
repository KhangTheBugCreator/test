/**
 * HealthCare Clinic - Action-First Interactive Controller
 * Connects navigation, quick booking forms, doctor/specialty filters,
 * live 3-step appointment summary, and confirmation modals across all pages.
 */
(function () {
  'use strict';

  // 1. Create Global Appointment Confirmation Modal
  function ensureModal() {
    if (document.getElementById('hc-confirm-modal')) return;
    const modalHtml = `
      <div id="hc-confirm-modal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-teal-100 relative animate-fade-in">
          <button type="button" id="hc-modal-close" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
          <div class="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-200">
            <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
          </div>
          <span class="inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            Xác nhận ưu tiên tiếp đón
          </span>
          <h3 id="hc-modal-title" class="text-2xl font-bold text-slate-900 mb-2">Đặt lịch khám thành công!</h3>
          <p id="hc-modal-desc" class="text-sm text-slate-600 mb-5 leading-relaxed">
            Hệ thống HealthCare đã ghi nhận phiếu hẹn khám ưu tiên của bạn. Điều dưỡng viên sẽ liên hệ qua Zalo/SMS trong vòng 3 phút.
          </p>
          <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500">Mã phiếu hẹn:</span>
              <span id="hc-modal-code" class="font-mono font-bold text-teal-700">HC-2026-8924</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Dịch vụ / Chuyên khoa:</span>
              <span id="hc-modal-spec" class="font-semibold text-slate-800">Khám Chuyên khoa</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Trạng thái Kiosk:</span>
              <span class="text-emerald-600 font-semibold">Ưu tiên — Không chờ đợi</span>
            </div>
          </div>
          <div class="flex gap-3">
            <a href="booking.html" class="flex-1 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-center text-sm shadow-sm transition-all">
              Xem chi tiết phiếu hẹn
            </a>
            <button type="button" id="hc-modal-ok" class="py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all">
              Đóng
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('hc-confirm-modal');
    const closeBtn = document.getElementById('hc-modal-close');
    const okBtn = document.getElementById('hc-modal-ok');
    [closeBtn, okBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }

  function showConfirmModal(opts) {
    ensureModal();
    const modal = document.getElementById('hc-confirm-modal');
    const title = document.getElementById('hc-modal-title');
    const desc = document.getElementById('hc-modal-desc');
    const code = document.getElementById('hc-modal-code');
    const spec = document.getElementById('hc-modal-spec');

    const randomCode = 'HC-' + Math.floor(100000 + Math.random() * 900000);
    if (title && opts.title) title.textContent = opts.title;
    if (desc && opts.desc) desc.textContent = opts.desc;
    if (code) code.textContent = randomCode;
    if (spec && opts.spec) spec.textContent = opts.spec;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // 2. Wire all forms cleanly with custom modal instead of browser alert()
  function initForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.removeAttribute('onsubmit');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const selectEl = form.querySelector('select');
        const specText = selectEl && selectEl.options[selectEl.selectedIndex]
          ? selectEl.options[selectEl.selectedIndex].text
          : 'Khám Chuyên khoa Quốc tế';
        const nameInput = form.querySelector('input[type="text"]');
        const patientName = nameInput && nameInput.value ? nameInput.value : 'Quý khách';

        showConfirmModal({
          title: 'Đã tiếp nhận lịch hẹn của ' + patientName + '!',
          desc: 'Phiếu đăng ký của bạn đã được chuyển tới Quầy Tiếp Đón Ưu Tiên HealthCare. Điều dưỡng trưởng sẽ liên hệ xác nhận trong 3 phút.',
          spec: specText
        });
      });
    });
  }

  // 3. Interactive Segmented Toggles & Filter Chips & Time Slot Pills
  function initInteractivePills() {
    // Time slot buttons and filter chips
    document.querySelectorAll('button').forEach(btn => {
      const text = (btn.textContent || '').trim();

      // Time slot format e.g. 08:00, 08:30, 09:45, 14:00
      if (/^\d{2}:\d{2}/.test(text)) {
        btn.addEventListener('click', function () {
          const parent = btn.parentElement;
          if (parent) {
            parent.querySelectorAll('button').forEach(sibling => {
              sibling.classList.remove('bg-primary', 'text-on-primary', 'ring-2', 'ring-primary');
            });
          }
          btn.classList.add('bg-primary', 'text-on-primary', 'ring-2', 'ring-primary');
          // Update summary time if on booking page
          const summaryTime = document.querySelector('[data-summary-time]');
          if (summaryTime) summaryTime.textContent = text.slice(0, 5) + ' - Hôm nay / Ngày mai';
        });
      }

      // Primary booking confirmation button on booking.html
      if (text.includes('Xác nhận đặt lịch hẹn ngay') || text.includes('Hoàn tất đặt lịch')) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          showConfirmModal({
            title: 'Xác nhận Đặt lịch khám Thành công!',
            desc: 'Mã QR Check-in Kiosk của bạn đã sẵn sàng. Vui lòng đến quầy ưu tiên tầng 1 trước giờ hẹn 10 phút.',
            spec: 'Khám Chuyên gia theo lịch hẹn'
          });
        });
      }
    });
  }

  // 4. Pre-fill booking parameters from URL query string if present
  function initBookingQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const doctor = params.get('doctor');
    const specialty = params.get('specialty');
    if (!doctor && !specialty) return;

    if (specialty) {
      document.querySelectorAll('select').forEach(sel => {
        Array.from(sel.options).forEach(opt => {
          if (opt.text.toLowerCase().includes(specialty.toLowerCase())) {
            sel.value = opt.value;
          }
        });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initForms();
    initInteractivePills();
    initBookingQueryParams();
  });
})();
