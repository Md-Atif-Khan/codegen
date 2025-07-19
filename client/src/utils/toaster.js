import { toast } from "react-toastify";

const toastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

export const showSuccessToast = (customMessage) => {
    toast.success(customMessage, {...toastOptions });
}

export const showErrorToast = (customMessage) => {
    toast.error(customMessage, {...toastOptions });
}