import React from 'react';

function Alert(props) {
  const capitalize = (word) => {
    if (!word) return "";
    if (word.toLowerCase() === "danger") return "Error";
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  return (
    <div>
      {props.alert && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-${props.alert.type === 'danger' ? 'red' : 'green'}-100 border border-${props.alert.type === 'danger' ? 'red' : 'green'}-400 text-${props.alert.type === 'danger' ? 'red' : 'green'}-700 px-4 py-2 rounded-lg shadow-md`}
          role="alert"
        >
          <strong>{capitalize(props.alert.type)}</strong>: {props.alert.msg}
        </div>
      )}
    </div>
  );
}

export default Alert;
