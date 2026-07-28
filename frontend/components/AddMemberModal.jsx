import { useState } from 'react';

export default function AddMemberModal({ isOpen, role, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [roleInput, setRoleInput] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setRoleInput('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (role === 'Teacher' && !roleInput.trim()) return;

    onSubmit(name.trim(), roleInput.trim());
    handleClose();
  };

  return (
    <div className={`modal-overlay active`} onClick={handleClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3 className="modal-title-text" id="modalTitle">Add New {role}</h3>
          <button className="modal-close-btn" id="modalClose" onClick={handleClose}>✕</button>
        </div>
        
        <form id="memberForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="memberName">Full Name</label>
            <input 
              className="form-input" 
              type="text" 
              id="memberName" 
              placeholder="e.g. Samuel Jackson" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          {role === 'Teacher' && (
            <div className="form-group" id="formRoleGroup">
              <label className="form-label" htmlFor="memberRole">Subject / Role</label>
              <input 
                className="form-input" 
                type="text" 
                id="memberRole" 
                placeholder="e.g. Biology Professor"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                required
              />
            </div>
          )}
          <button className="form-submit-btn" type="submit" id="formSubmitBtn">
            Add {role}
          </button>
        </form>
      </div>
    </div>
  );
}
