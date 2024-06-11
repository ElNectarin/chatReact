import axios from "axios";
import React from "react";

interface Props {
  users: [];
}

interface User {
  id: number;
  username: string;
}

const GroupCreator: React.FC<Props> = ({ users }) => {
  const [groupName, setGroupName] = React.useState("");
  const [selectedParticipants, setSelectedParticipants] = React.useState<
    User[]
  >([]);

  const handleSetGroupName: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    setGroupName(e.target.value);
  };

  const handleSelectParticipant: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => {
    const username = e.target.name;
    const isChecked = e.target.checked;

    if (isChecked) {
      const participant = users.find(
        (user: User) => user.username === username
      );

      if (participant) {
        setSelectedParticipants([...selectedParticipants, participant]);
      }
    } else {
      setSelectedParticipants(
        selectedParticipants.filter((p) => p.username !== username)
      );
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/conversations", {
        name: groupName,
        participants: selectedParticipants,
      });

      if (response.status === 201) {
        const conversation = response.data;
        console.log("Created conversation:", conversation);
      } else {
        console.error("Error creating conversation:", response.status);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        width: "50vh",
        height: "50vh",
        padding: "2vh",
        boxShadow: "5px 6px 15px 0px black",
      }}
    >
      <h1 style={{ fontSize: "3vh", fontWeight: "bold", margin: "0 auto" }}>
        Создание беседы
      </h1>
      <div>
        <form onSubmit={handleCreateConversation}>
          <div style={{ marginTop: "2vh" }}>
            <h1 style={{ fontSize: "3vh", width: "100%" }}>
              Введите название беседы
            </h1>
            <input
              value={groupName}
              onChange={handleSetGroupName}
              placeholder="Название беседы"
              style={{
                width: "100%",
                height: "3vh",
                fontSize: "1.9vh",
                marginTop: "3px",
              }}
            />
          </div>
          <div style={{ marginTop: "2vh" }}>
            <h1 style={{ fontSize: "3vh" }}>Выберите участников</h1>

            {users.map((user: User) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "5px",
                }}
              >
                <label htmlFor={String(user.id)} style={{ fontSize: "2.1vh" }}>
                  {user.username}
                </label>
                <input
                  type="checkbox"
                  name={user.username}
                  id={String(user.id)}
                  onChange={handleSelectParticipant}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "0",
              display: "flex",
              justifyContent: "center",
              width: "90%",
              marginBottom: "5px",
            }}
          >
            <button type="submit" style={{ fontSize: "2vh" }}>
              Создать беседу
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreator;
