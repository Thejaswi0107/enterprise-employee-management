// React import not required with the new JSX transform

const ConfirmationModal = ({
  show,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="delete-modal-buttons">
          <button className="cancel-delete-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-delete-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
