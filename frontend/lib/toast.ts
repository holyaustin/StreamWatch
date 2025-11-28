import toast from "react-hot-toast";

export function success(msg: string) {
  toast.success(msg);
}

export function error(msg: string) {
  toast.error(msg);
}

export function info(msg: string) {
  toast(msg);
}
