import * as React from "react";
import {
  checkPermissions,
  createTask,
  getAssignTo,
  getCurrentUserDetails,
  getLookupDetails,
  getfields,
  saveItemToList,  
} from "./Formss";
import {
  DefaultButton,
  Dropdown,
  Panel,
  PrimaryButton,
  TextField,
} from "@fluentui/react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
const buttonStyles = { root: { marginRight: 8 } };

const AddForm = (props) => {
  const [FormFields, setFormfields] = React.useState([{}]);
  const [isopen, setisOpen] = React.useState(false);
  const [Result, setResult] = React.useState<any>({});
  const [error, seterror] = React.useState("");
  const [disablesavebutton, setdisablesavebutton] = React.useState(false);
  const [defaultUser, setDefaultUser] = React.useState<any>(null);

  React.useEffect(() => {
    listitems();
  }, []);

  React.useEffect(() => {
    props.rowData && setisOpen(true);
    listitems();
  }, [props.rowData]);

  const listitems = () => {
    var Tempbuildfields: any = [];
    var orderFields: any = [];
    getfields(props.ListName).then(async (data) => {
      console.log(data, "falag1");

      if (data && data.length > 0) {
        await Promise.all(
          data.map(async (items) => {
            console.log("item1", items);
            if (items["TypeAsString"] === "Text") {
              orderFields.push(items["InternalName"]);
              Tempbuildfields.push({
                Id: items.Id,
                Title: items.Title,
                InternalName: items.InternalName,
                Required: items.Required,
                TypeAsString: items.TypeAsString,
                //defaultValue:props.rowData[items.InternalName]
              });
            } else if (items["TypeAsString"] === "User") {
              orderFields.push(items["InternalName"]);
              Tempbuildfields.push({
                Id: items.Id,
                Title: items.Title,
                InternalName: items.InternalName,
                Required: items.Required,
                TypeAsString: items.TypeAsString,
                // defaultValue:props.rowData[items.InternalName]
              });
            } else if (items["TypeAsString"] === "Lookup") {
              orderFields.push(items["InternalName"]);
              const lookdata = await getLookupDetails(
                items["LookupList"],
                items["LookupField"]
              );
              console.log("looks", lookdata);
              Tempbuildfields.push({
                Id: items.Id,
                Title: items.Title,
                InternalName: items.InternalName,
                Required: items.Required,
                TypeAsString: items.TypeAsString,
                LookupData: lookdata,
                //defaultValue:props.rowData[items.InternalName]
              });
            }
          })
        );
        console.log(Tempbuildfields, "Tempbuildfields");
        var finalfields: any = [];
        orderFields.map((values) => {
          Tempbuildfields.map((order) => {
            if (values === order["InternalName"]) finalfields.push(order);
          });
        });
        // Tempbuildfields = finalfields;
        console.log(finalfields, "check");
        setFormfields(finalfields);
      }
    });
  };

  const dismissPanel = () => {
    setisOpen(false);
    setdisablesavebutton(false);
    seterror("");
  };

  const onChangeHandlerforms = (value, InternalName, TypeAsString) => {
    switch (TypeAsString) {
      case "Text":
        let textvalue = value.target.value;
        setResult((Prev) => ({ ...Prev, [InternalName]: textvalue }));
        break;
      case "User":
        const useid = value[0].id;
        setResult((Prev) => ({ ...Prev, [InternalName]: useid }));
        // const defaultValue = defaultUser ? defaultUser.Id : null;
        // setResult((Prev) => ({
        //   ...Prev,
        //   [InternalName]: defaultValue || useid,
        // }));

        console.log("resultlookup", Result);
        break;

      case "Lookup":
        //const lookupId = value[0].id;
        console.log("loo", value);
        setResult((Prev) => ({ ...Prev, [InternalName]: value }));
        console.log("resultlookup", Result);
        break;
      default:
    }
  };

  const OnSave = async () => {
    let temp = {};
    let validationErrors = false;

    FormFields.map((field) => {
      if (!field["Required"] && !Result[field["InternalName"]]) {
        seterror("Text field is required");
        validationErrors = true;
        setdisablesavebutton(true);
        return; // Stop further processing if there's an error
      }
    });

    if (validationErrors) {
      return;
    }

    //let Result=[] //Object .map //FormFields. filter return type as string //temp object push
    Object.entries(Result).forEach(([key, item]: any) => {
      console.log("ii", key, item);
      FormFields.filter((field) => {
        return key === field["InternalName"];
      }).forEach((field) => {
        let value = "";
        if (field["TypeAsString"] === "User") {
          value = field["InternalName"] + "Id";
          console.log("valuess", value);
          temp = { ...temp, [value]: item };
          console.log("temp", temp);
        } else if (field["TypeAsString"] === "Lookup") {
          value = field["InternalName"] + "Id";
          console.log("valuess", value);
          temp = { ...temp, [value]: item.key };
          console.log("temp", temp);
        } else {
          value = field["InternalName"];
          console.log("valuess", value);
          temp = { ...temp, [value]: item };
          console.log("temp", temp);
        }
      });
    });

    if (Result.RequestType && Result.RequestType.key) {
      const selectById = Result.RequestType.key;
      const assignedToId = await getAssignTo(selectById);
      console.log(assignedToId, "assigntoos");

      saveItemToList(props.ListName, temp).then((datsa) => {
        console.log("save data successfully", datsa);
        listitems();
        setisOpen(false);
        seterror("");
        setdisablesavebutton(false);
        createTask(
          Result.Title + "Task",
          assignedToId?.TaskUserId,
          Result.TaskComment,
          selectById
        );
      });
    } else {
      saveItemToList(props.ListName, temp).then((datsa) => {
        console.log("save data successfully", datsa);
        listitems();
        setisOpen(false);
        seterror("");
        setdisablesavebutton(false);
      });
    }
  };
  console.log("Result", Result);

  const onRenderFooterContent = React.useCallback(
    () => (
      <div>
        {/* {saveButton ? (
          <PrimaryButton onClick={OnSave} styles={buttonStyles}>
            Save
          </PrimaryButton>
        ) : (
        //   <PrimaryButton onClick={onUpdate} styles={buttonStyles}>
        //     Update
        //   </PrimaryButton>
          {setSaveButton}
        )} */}
        <PrimaryButton
          onClick={OnSave}
          styles={buttonStyles}
          disabled={error ? true : disablesavebutton}
        >
          Save
        </PrimaryButton>
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
    [OnSave]
  );

  const onHandlePanel = async () => {
    try {
      const allowedGroupsForList =
        props.ListName === "Request Type"
          ? ["CM Administrators"]
          : ["CM Requestors"];

      const hasPermission = await checkPermissions(
        props.ListName,
        allowedGroupsForList
      );

      if (hasPermission) {
        setisOpen(true);
        listitems();
      } else {
        alert(
          "You do not have the necessary permissions to perform this action."
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log("formsss", FormFields);
  console.log("result ", Result);
  console.log("default", defaultUser);

  return (
    <>
      <div className="AddForm">
        <div className="button-container">
          <PrimaryButton text="AddForm" onClick={onHandlePanel} />
        </div>
        <Panel
          headerText={props.ListName}
          isOpen={isopen}
          onDismiss={dismissPanel}
          onRenderFooterContent={onRenderFooterContent}
        >
          {FormFields &&
            FormFields.length > 0 &&
            FormFields.map((item: any) => {
              console.log("forms", item["TypeAsString"]);
              switch (item["TypeAsString"]) {
                case "Text":
                  return (
                    <TextField
                      label={"Enter the " + item["Title"] + " value"}
                      placeholder={"Enter the " + item["InternalName"]}
                      // value={Result[item.Internalname]}
                      value={Result[item.Internalname]}
                      onChange={(value) => {
                        onChangeHandlerforms(
                          value,
                          item["InternalName"],
                          item["TypeAsString"]
                        );
                        seterror("");
                        setdisablesavebutton(false);
                      }}
                      required={item["Required"]}
                      errorMessage={error}
                      onBlur={() => {
                        if (!Result[item.InternalName]) {
                          seterror("Text field is required");
                          setdisablesavebutton(true);
                        }
                      }}
                    />
                  );
                  break;

                case "User":
                  return (
                    <PeoplePicker
                      titleText={item["InternalName"]}
                      context={props.context}
                      peoplePickerCntrlclassName={"ms-PeoplePicker"}
                      ensureUser={true}
                      //defaultSelectedUsers={[defaultUser]}
                      principalTypes={[PrincipalType.User]}
                      groupName="CM Task User "
                      resolveDelay={500}
                      onChange={(value: any[]) => {
                        onChangeHandlerforms(
                          value,
                          item["InternalName"],
                          item["TypeAsString"]
                        );
                      }}
                    />
                  );

                  break;
                case "Lookup":
                  return (
                    <Dropdown
                      placeholder="Select an option"
                      label={"Enter the " + item["Title"]}
                      options={item["LookupData"]}
                      onChange={(ev, value) => {
                        onChangeHandlerforms(
                          value,
                          item["InternalName"],
                          item["TypeAsString"]
                        );
                      }}
                      // selectedKey={}
                    />
                  );
                  break;
                default:
                  return null;
              }
            })}
        </Panel>
      </div>
    </>
  );
};
export default AddForm;
