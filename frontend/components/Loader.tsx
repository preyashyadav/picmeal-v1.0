import React from "react";

const Loader = () => (
    <div className="loader">
      <div className="panWrapper">
        <div className="pan">
          <div className="veggies">
            <div className="veg"></div>
            <div className="veg"></div>
            <div className="veg"></div>
            <div className="veg"></div>
          </div>
          <div className="panBase"></div>
          <div className="panHandle"></div>
        </div>
        <div className="panShadow"></div>
      </div>
    </div>
);

export default Loader;
