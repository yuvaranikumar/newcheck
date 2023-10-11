import * as React from "react";

import "./style.css";
import Listlib from "./Listlib";
import AddForm from "./Addform";
import TaskUserList from "./TaskUser";

const Forms = (props) => {
  return (
    <>
      <div className="main">
        <div className="Request Type">
          <AddForm ListName="Request Type" context={props.context} />

          <Listlib
            Label="Request Type"
            ListName="Request Type"
            context={props.context}
          />
        </div>
        <div className="space">
          <AddForm
            ListName="Request Data"
            context={props.context}
            className="button-container"
          />
          <Listlib
            Label="Request Data"
            ListName="Request Data"
            context={props.context}
          />
        </div>
        <div className="main">
          <h2>User Task</h2>
          <div className="custom-details-list space ">
            <TaskUserList context={props.context} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Forms;
