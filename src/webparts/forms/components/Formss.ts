import { sp } from "@pnp/sp/presets/all";
export const fetchListData = async (listName: string) => {
  try {
    const list = sp.web.lists.getByTitle(listName);
    const renderListDataParams = {
      ViewXml: "<View><RowLimit>5</RowLimit></View>",
    };
    const response = await list.renderListDataAsStream(renderListDataParams);
    console.log(response, "rr");
    return response.Row;
  } catch (error) {
    console.error("Error fetching list data:", error);
    throw error;
  }
};
export const getfields = async (listnames) => {
  const fields = sp.web.lists
    .getByTitle(listnames)
    .fields.filter(
      "Hidden eq false and Sealed eq false and InternalName ne 'ContentType' and TypeAsString ne 'Computed'and InternalName ne '_UIVersionString' and InternalName ne 'Attachments' and InternalName ne 'AppAuthor' and InternalName ne'FolderChildCount'and InternalName ne '_ComplianceTag'and InternalName ne '_ComplianceTagWrittenTime'and InternalName ne '_ComplianceTagUserId'and InternalName ne 'ComplianceAssetId'and InternalName ne '_ComplianceFlags'and InternalName ne 'ItemChildCount' and InternalName ne 'AppEditor' and InternalName ne'Modified' and InternalName ne 'Created' and InternalName ne 'Author' and InternalName ne 'Editor' and InternalName ne '_ColorTag'"
    )
    .get();
  console.log(fields, "fields");
  return fields;
};

export const getLookupDetails = async (lookupId, lookupField) => {
  const lookUpData = await sp.web.lists
    .getById(lookupId)
    .items.select(lookupField, "ID")
    .get()
    .then(async (data) => {
      const listTitle = sp.web.lists.getById(lookupId);
      const r = await listTitle.select("Title")();
      console.log("list Title", r.Title);
      const lookupArr: any = [];
      console.log("getLookupDetails", data);
      data.map((item) => {
        lookupArr.push({
          key: item.Id,
          text: item[lookupField],
          ListName: r.Title,
        });
      });
      console.log("lookupArr", lookupArr);
      return lookupArr;
    })
    .catch((data) => {
      console.log("catchdata----getLookupDetails", data);
    });
  console.log("lookUpData", lookUpData);

  return lookUpData;
};

export const saveItemToList = async (listname, value) => {
  console.log("saveitems", listname, value);
  const listFolders = await sp.web.lists.getByTitle(listname).items.add(value);
  return listFolders;
};

export const updateItems = async (ListName, userID, value) => {
  const itemFolders = await sp.web.lists
    .getByTitle(ListName)
    .items.getById(userID)
    .update(value);
  return itemFolders;
};

export const taskuser = async () => {
  const currentUser = await sp.web.currentUser.get();
  const tasks = await sp.web.lists
    .getByTitle("User Task")
    .items.filter(`AssignedToId eq ${currentUser.Id}`)
    .expand("AssignedTo/Title")
    .select("Title,AssignedTo/Title,Status,ID")
    .get();

  return tasks.map((task) => ({
    Title: task.Title,
    AssignedTo: task.AssignedTo ? task.AssignedTo.Title : "Unassigned",
    Status: task.Status,
    ID: task.ID,
  }));
};

export const createTask = async (
  taskTitle,
  assignedToId,
  taskComment,
  requestId
) => {
  const user = await sp.web.lists.getByTitle("User Task").items.add({
    Title: taskTitle,
    AssignedToId: assignedToId,
    TaskComment: taskComment,
    Status: "Not Started",
    RequestDataID: requestId,
  });
  console.log("usersss", user);
  return user;
};

export const getAssignTo = async (ID) => {
  const assign = await sp.web.lists
    .getByTitle("Request Type")
    .items.getById(ID)
    .get();
  console.log(assign, "assign");
  return assign;
};

export const updateItemss = async (userID, value) => {
  const itemFolders = await sp.web.lists
    .getByTitle("User Task")
    .items.getById(userID)
    .update({
      Title: value.Title,
      AssignedToId: value.AssignedToId,
      Status: value.Status,
      TaskComment: value.TaskComment,
      ID: value.ID,
    });
  console.log("item", itemFolders);
  return itemFolders;
};

export const updatedTask = async (userID) => {
  const assid = await sp.web.lists
    .getByTitle("User Task")
    .items.getById(userID)
    .get();
  console.log(assid);
  return assid;
};

export const getCurrentUserDetails = async () => {
  try {
    const user = await sp.web.currentUser.get();

    const currentUserDetails = {
      id: user.Id,
      login: user.LoginName,
      email: user.Email,
      title: user.Title,
    };
    console.log("iddetails", user);

    return currentUserDetails;
  } catch (error) {
    console.error("Error fetching current user details:", error);
    throw error;
  }
};

export const checkPermissions = async (listName, allowedGroups) => {
  try {
    const userGroups = await sp.web.currentUser.groups.get();

    const isInAllowedGroup = userGroups.some((group) => {
      return allowedGroups.includes(group.Title);
    });

    return isInAllowedGroup;
  } catch (error) {
    console.error(error);
    return false;
  }
};
