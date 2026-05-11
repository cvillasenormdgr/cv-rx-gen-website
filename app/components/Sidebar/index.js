import React from "react";
import clsx from "clsx";
import "./sidebar.css";

// ─── Single pullable panel ────────────────────────────────────────────────────
const SidebarPanel = ({
  label,
  icon,
  color,
  tabOffset,
  children,
  dispatch,
  state,
}) => {
  const isOpen = state.modalsOpen.includes(label);
  const toggleModal = () => {
    if (isOpen) {
      dispatch({ type: "CLOSE_MODAL", payload: label });
    } else {
      dispatch({ type: "OPEN_MODAL", payload: label });
    }
  }
  return (
    <>
      {isOpen && (
        <div
          className="sp-overlay"
          onClick={toggleModal}
          aria-hidden="true"
        />
      )}

      <div
        className={clsx("sp", isOpen && "sp--open")}
        style={{ "--sp-color": color }}
      >
        {/* Bookmark tab */}
        <button
          className="sp__tab"
          onClick={toggleModal}
          aria-label={isOpen ? `Close ${label}` : `Open ${label}`}
          style={{ top: tabOffset, background: color }}
        >
          <span className="sp__tab-icon">{icon}</span>
          <span className="sp__tab-label">{label}</span>
        </button>

        {/* Drawer — color driven by prop */}
        <div className="sp__drawer" style={{ background: color }}>
          <div className="sp__drawer-header">
            <span>{icon} {label}</span>
            <button className="sp__close" onClick={toggleModal}>✕</button>
          </div>
          <div className="sp__drawer-body">{children}</div>
        </div>
      </div>
    </>
  );
};

// ─── Sidebar — stack of independent pull panels ───────────────────────────────
const Sidebar = ({ dispatch, state, consultState, consultDispatch }) => {
  const { document } = consultState;
  return (
    <>
      {/* Panel 1 */}
      <SidebarPanel
        label="Document Settings"
        icon="📋"
        color="#3a7bd5"
        tabOffset="20%"
        dispatch={dispatch}
        state={state}
      >
        <p>Your first panel content goes here.</p>
        <ul>
          <li>Item A</li>
          <li>Item B</li>
          <li>Item C</li>
        </ul>
      </SidebarPanel>

      {/* Panel 2 */}
      <SidebarPanel
        label="Prescription"
        icon="🔖"
        color="#7b5ea7"
        tabOffset="calc(20% + 200px)"
        dispatch={dispatch}
        state={state}
      >
        {document && (
          <div className="flex flex-col items-center gap-3 h-[100%] w-full p-8">
            <a
              href={document}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full"
            >
              <iframe
                src={`${document}#toolbar=0&navpanes=0&view=FitH`}
                title="Prescription preview"
                className="w-full h-full border-0"
              />
            </a>
          </div>
        )}
        {/* <p>Your second panel content goes here.</p>
        <button className="sp__action-btn">Action</button> */}
      </SidebarPanel>
    </>
  );
};

export default Sidebar;