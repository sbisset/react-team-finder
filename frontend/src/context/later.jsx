  const handleUpdateStatus = async (type, id, status) => {
  try {
    // example calls for updating apps/invs
    if (type === "received_apps") {
      await updateAppStatus(id, status); //  implement this
    } else {
      await updateInviteStatus(id, status); // implement this 
    }
    toast.success("Request updated successfully");
    toggle(); // close the popup
  } catch (err) {
    toast.error("Failed to update request");
  }
};




