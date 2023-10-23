export const donorColumns = [
    {
      dataField: "_id",
      text: "Id",
      headerStyle: {
        backgroundColor: "#DEDADA"
      }
    },
    {
      dataField: "name",
      text: "Name",
      sort: true,
      headerStyle: {
        backgroundColor: "#DEDADA"
      }
    },
    {
      dataField: "email",
      text: "Email",
      headerStyle: {
        backgroundColor: "#DEDADA"
      },
    },
    {
      dataField: "registerDate",
      text: "Registerd On",
      headerStyle: {
        backgroundColor: "#DEDADA"
      },
    },
    {
      dataField: "status",
      text: "Status",
      sort: true,
      headerStyle: {
        backgroundColor: "#DEDADA"
      },
      formatter: (cell) =>(  
        <span>
          <strong style={ { color: `${cell === 'rejected' ? 'red' : 'green'}`, textTransform: 'capitalize'} }> { cell } </strong>
        </span>
      )
    }
  ];