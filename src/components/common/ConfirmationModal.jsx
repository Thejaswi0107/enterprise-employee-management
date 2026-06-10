// React import not required with the new JSX transform

const ConfirmationModal = ({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = false,
  children,
}) => {
  return (
    <div className="delete-modal-overlay">
      <div className={`delete-modal ${isDangerous ? 'dangerous' : ''}`}>
        <h3>{title}</h3>
        <p>{message}</p>
        {children && <div className="modal-content">{children}</div>}
        <div className="delete-modal-buttons">
          <button className="cancel-delete-btn" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`confirm-delete-btn ${isDangerous ? 'dangerous' : ''}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
