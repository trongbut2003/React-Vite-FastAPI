import "./Table.css";

function ReportTable({ headers = [], data =[] }) {

    return (
        <div className="report-container">

            <table className="report-table">

                <thead>

                    <tr>

                        {headers.map((header, index) => (
                            <th key={index}>
                                {header}
                            </th>
                        ))}

                    </tr>

                </thead>


                <tbody>

                    {data.map((row, rowIndex) => (

                        <tr key={rowIndex}>

                            {row.map((value, colIndex) => (

                                <td key={colIndex}>
                                    {value}
                                </td>

                            ))}

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default ReportTable;