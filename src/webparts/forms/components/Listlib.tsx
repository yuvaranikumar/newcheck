import * as React from "react";
import { fetchListData, getfields } from "./Formss";
import { DetailsList, IColumn } from "@fluentui/react";
import AddForm from "./Addform";

const Listlib = (props) => {
  const [Type, setType] = React.useState<any>([]);
  const [Fields, setFields] = React.useState<any>([]);
  const [rowData, setrowData] = React.useState<any>(null);
  const [updatepanel, setupdatepanel] = React.useState(false);
  console.log("rowData", rowData)

  React.useEffect(() => {
    fetch();
    getfields(props.ListName).then((getfieldstype) => {
      console.log(getfieldstype, "flag1");
      setFields(getfieldstype);
    });
  }, []);

  const fetch = () => {
    fetchListData(props.ListName).then((data) => {
      console.log("typedata", data);
      setType(data);
    });
  };

  const Typecolumns: IColumn[] = Fields.map((field, index) => {
    return {
      key: field.InternalName,
      name: field.Title,
      fieldName: field.InternalName,
      minWidth: 100,
      maxWidth: 200,
      isMultiline: true,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      sortAscendingAriaLabel: "Sorted A to Z",
      sortDescendingAriaLabel: "Sorted Z to A",
      data: "string",
      isPadded: true,
      onRender: (item) => {
        // Handle User field
        if (field.TypeAsString === "User") {
          if (item[field.InternalName] && item[field.InternalName].length > 0) {
            return (
              <div>
                <p>{item[field.InternalName][0].title}</p>
              </div>
            );
          } else {
            return <span>No User</span>;
          }
        }

        // Handle Lookup field
        if (field.TypeAsString === "Lookup") {
          if (item[field.InternalName] && item[field.InternalName].length > 0) {
            return <span>{item[field.InternalName][0].lookupValue}</span>;
          } else {
            return <span>No Data</span>;
          }
        }

        // Render other field types as default
        return (
          <p
            onClick={() => {
              setrowData(item);
              setupdatepanel(true);
            }}
          >
            {item[field.InternalName]}
          </p>
        );
      },
    };
  });

  return (
    <>
      <div className="Heading ">
        <div className="table">
          <h2>{props.Label}</h2>
          <DetailsList
            items={Type}
            columns={Typecolumns}
            setKey="none"
            isHeaderVisible={true}
            className="custom-details-list custom-details-list .ms-DetailsHeader custom-details-list .ms-DetailsRow-cell"
            onItemInvoked={(item) => {
              setrowData(item);
              setupdatepanel(true);
              console.log("itemsinvoked",item);
            }}
          />
        </div>
        {updatepanel && rowData && (
          <AddForm
            ListName={props.ListName}
            context={props.context}
            rowData={rowData}
          />
        )}
      </div>
    </>
  );
};

export default Listlib;
