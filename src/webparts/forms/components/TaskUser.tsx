import * as React from "react";
import { taskuser, updateItemss, updatedTask } from "./Formss";
import {
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Panel,
  PanelType,
  PrimaryButton,
  SelectionMode,
  TextField,
} from "@fluentui/react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { sp } from "@pnp/sp/presets/all";
const buttonStyles = { root: { marginRight: 8 } };
const TaskUserList = (props) => {
  const [userTasks, setUserTasks] = React.useState([{}]);
  const [DetailsView, setDetailsView] = React.useState({
    Title: "",
    AssignedTo: "",
    Status: "",
    TaskComment: "",
    ID: "",
  });
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [reassignDetails, setReassignDetails] = React.useState({
    NewAssignee: "",
    ReassignComments: "",
  });
  const [isReassignVisible, setIsReassignVisible] = React.useState(false);

  React.useEffect(() => {
    taskuser().then((data) => {
      setUserTasks(data);
      console.log("datauser ", data);
    });
  }, []);

  const columns = [
    {
      key: "column1",
      name: "Task Title",
      fieldName: "Title",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: "column2",
      name: "Assigned To",
      fieldName: "AssignedTo",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: "column3",
      name: "Status",
      fieldName: "Status",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: "column3",
      name: "ID",
      fieldName: "ID",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
  ];

  const handleItemInvoked = (item) => {
    console.log(item, "columnitem");
    setDetailsView(item);
    setIsPanelOpen(true);
  };

  const handlePanelDismiss = () => {
    setIsPanelOpen(false);
  };

  const handleTextFieldChange = (fieldName, value) => {
    setDetailsView({ ...DetailsView, [fieldName]: value });
  };

  const dismissPanel = () => {
    setIsPanelOpen(false);
  };

  const handleApprove = async () => {
    try {
      await updateItemss(DetailsView.ID, {
        Status: "Approved",
        //TaskComment: DetailsView.TaskComment,
      });

      const updatedTasks = userTasks.map((task) => {
        if (task["ID"] === DetailsView.ID) {
          return {
            ...task,
            Status: "Approved",
            //TaskComment: DetailsView.TaskComment,
          };
        }
        return task;
      });

      setUserTasks(updatedTasks);
      dismissPanel();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleReject = async () => {
    try {
      await updateItemss(DetailsView.ID, {
        Status: "Rejected",
        //TaskComment: DetailsView.TaskComment,
      });

      const updatedTasks = userTasks.map((task) => {
        if (task["ID"] === DetailsView.ID) {
          return {
            ...task,
            Status: "Rejected",
           // TaskComment: DetailsView.TaskComment,
          };
        }
        return task;
      });

      setUserTasks(updatedTasks);
      dismissPanel();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleReassign = () => {
    handleReassignSave();
    setIsReassignVisible(true);
  };

  const handlePeoplePickerChange = (items) => {
    setReassignDetails({ ...reassignDetails, NewAssignee: items });
  };
  const onchangecomment = (e, val) => {
    setReassignDetails({ ...reassignDetails, ReassignComments: val });
  };

  const handleReassignSave = async () => {
    try {
      let newAssigneeId = null;

      if (
        reassignDetails.NewAssignee &&
        reassignDetails.NewAssignee.length > 0
      ) {
        newAssigneeId = reassignDetails.NewAssignee[0]["id"];
      }

      if (newAssigneeId !== null) {
        await updateItemss(DetailsView.ID, {
          AssignedToId: newAssigneeId,
          TaskComment: reassignDetails.ReassignComments,
        });

        const updatedTaskss = await updatedTask(DetailsView.ID);
        console.log("updte",updatedTaskss)
        const updatedTasks = userTasks.map((task) => {
          console.log("taskss",task)
          if (task["ID"] === DetailsView.ID) {
            return {
              ...task,
              AssignedTo: newAssigneeId,
              TaskComment: reassignDetails.ReassignComments,
              Status: "Reassigned",
              AssignedToName: updatedTaskss.Title,
            };
          }
          return task;
        });

        setUserTasks(updatedTasks);

        setIsReassignVisible(false);
        setIsPanelOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const onRenderFooterContent = React.useCallback(
    () => (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={handleApprove} styles={buttonStyles}>
          Approve
        </PrimaryButton>
        <DefaultButton onClick={handleReject} styles={buttonStyles}>
          Reject
        </DefaultButton>
        <DefaultButton onClick={handleReassign} styles={buttonStyles}>
          Reassign
        </DefaultButton>
        <DefaultButton
          onClick={() => {
            dismissPanel();
          }}
          styles={buttonStyles}
        >
          Cancel
        </DefaultButton>
      </div>
    ),
    [handleApprove, handleReject, handleReassign]
  );

  return (
    <div>
      <DetailsList
        items={userTasks}
        columns={columns}
        setKey="set"
        layoutMode={DetailsListLayoutMode.fixedColumns}
        selectionMode={SelectionMode.none}
        onItemInvoked={handleItemInvoked}
      />
      <Panel
        headerText="Task Details"
        isOpen={isPanelOpen}
        onDismiss={handlePanelDismiss}
        closeButtonAriaLabel="Close"
        onRenderFooterContent={onRenderFooterContent}
        styles={{ main: { maxWidth: "30%" } }}
        type={PanelType.custom}
      >
        <TextField
          label="Task Title"
          value={DetailsView.Title}
          onChange={(e, val) => handleTextFieldChange("Title", val)}
        />
        <TextField
          label="Assigned To"
          value={DetailsView.AssignedTo}
          onChange={(e, val) => handleTextFieldChange("AssignedTo", val)}
        />
        <TextField
          label="Status"
          value={DetailsView.Status}
          onChange={(e, val) => handleTextFieldChange("Status", val)}
        />

        <TextField
          label="ID"
          value={DetailsView.ID}
          onChange={(e, val) => handleTextFieldChange("ID", val)}
        />
        {isReassignVisible && (
          <>
            <PeoplePicker
              titleText={"Select new Assignee"}
              context={props.context}
              peoplePickerCntrlclassName={"ms-PeoplePicker"}
              ensureUser={true}
              principalTypes={[PrincipalType.User]}
              resolveDelay={500}
              onChange={handlePeoplePickerChange}
            />

            <TextField
              label="Comments"
              multiline
              rows={4}
              value={reassignDetails.ReassignComments}
              onChange={(e, val) => onchangecomment(e, val)}
            />
          </>
        )}
      </Panel>
    </div>
  );
};

export default TaskUserList;
