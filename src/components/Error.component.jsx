import React from "react";
import { connect } from "react-redux";
import history from "../history";

const NoAutorizado = ({ mensaje }) => {
    return(
        <div>
            <div>
    	        <h3 className="display-4 text-center text-dark">{ mensaje }</h3>    	                              
            </div>	 
            <div class="d-grid gap-2 col-5 mx-auto">
                <button onClick={() => history.push("/")} type="button" class="btn btn-dark me-md-2  mt-4">PRINCIPAL</button>
            </div> 
        </div>  
    )
}

export default connect( null, null )( NoAutorizado );