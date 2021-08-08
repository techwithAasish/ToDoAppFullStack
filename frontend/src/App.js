import React, { Component } from "react";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: "",
        completed: false,
      },
      editing: false,
    };
    this.fetchTask = this.fetchTask.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.startDelete = this.startDelete.bind(this);
    this.strikeUnstrike = this.strikeUnstrike.bind(this);
  }

  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentWillMount() {
    this.fetchTask();
  }

  // fetching data from the api
  fetchTask() {
    console.log("Fetching...");
    fetch("http://127.0.0.1:8000/api/task-list/")
      .then((response) => response.json())
      .then((data) => this.setState({ todoList: data }));
  }

  handleChange(e) {
    var name = e.target.name;
    var value = e.target.value;
    console.log("Name:", name);
    console.log("Value:", value);

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value,
      },
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log("Items:", this.state.activeItem);

    var csrftoken = this.getCookie("csrftoken");

    var url = "http://127.0.0.1:8000/api/task-create/";

    if (this.state.editing === true) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`;
      this.setState({
        editing: false,
      });
    }
    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(this.state.activeItem),
    })
      .then((response) => {
        this.fetchTask();
        this.setState({
          activeItem: {
            id: null,
            title: "",
            completed: false,
          },
        });
      })
      .catch(function (error) {
        console.log("Error:", error);
      });
  }

  // for editing
  startEdit = (task) => {
    this.setState({
      activeItem: task,
      editing: true,
    });
  };

  //for deleting data
  startDelete = (task) => {
    var csrftoken = this.getCookie("csrftoken");
    var url = `http://127.0.0.1:8000/api/task-delete/${task.id}/`;

    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
    }).then((response) => {
      this.fetchTask();
    });
  };

  strikeUnstrike = (task) =>{
    task.completed = !task.completed
    var csrftoken = this.getCookie("csrftoken");
    var url = `http://127.0.0.1:8000/api/task-update/${task.id}/`;

    fetch(url, {
      method:"POST",
      headers:{
        "Content-type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({'completed': task.completed, 'title': task.title})
    }).then(()=>{
      this.fetchTask()
    })

  }

  render() {
    const tasks = this.state.todoList;
    var self = this;
    return (
      <>
        <div className="container">
          <div id="task-container">
            <div id="form-wrapper">
              <form onSubmit={this.handleSubmit} id="form">
                <div className="flex-wrapper">
                  <div style={{ flex: 6 }}>
                    <input
                      onChange={this.handleChange}
                      type="text"
                      className="form-control"
                      id="title"
                      value={this.state.activeItem.title}
                      name="title"
                      placeholder="Add task here.."
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <input
                      type="submit"
                      name="Add"
                      id="submit"
                      className="btn btn-warning"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div id="list-wrapper">
              {tasks.map((task) => {
                return (
                  <div className="task-wrapper flex-wrapper" key={task.id}>
                    <div onClick={() =>self.strikeUnstrike(task)} style={{ flex: 7 }}>
                      {task.completed === false ? (
                        <span>{task.title}</span>
                      ) : (
                        <strike>{task.title}</strike>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <button
                        onClick={() => self.startEdit(task)}
                        className="btn btn-sm btn-outline-info"
                      >
                        Edit
                      </button>
                    </div>

                    <div style={{ flex: 1 }}>
                      <button
                        onClick={() => self.startDelete(task)}
                        className="btn btn-sm btn-outline-dark delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default App;
