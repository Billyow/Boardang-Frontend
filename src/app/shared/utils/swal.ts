import Swal, { SweetAlertOptions } from 'sweetalert2';

const base: SweetAlertOptions = {
  background: '#1e1e2e',
  color: '#cdd6f4',
  confirmButtonColor: '#89b4fa',
  iconColor: undefined, // overridden per type below
  customClass: {
    popup: 'swal-boardang',
    confirmButton: 'swal-boardang-btn',
  },
};

export const swal = {
  success: (title: string, text?: string) =>
    Swal.fire({
      ...base,
      icon: 'success',
      iconColor: '#a6e3a1',
      title,
      text,
    }),

  error: (title: string, text?: string) =>
    Swal.fire({
      ...base,
      icon: 'error',
      iconColor: '#f38ba8',
      title,
      text,
    }),
};
