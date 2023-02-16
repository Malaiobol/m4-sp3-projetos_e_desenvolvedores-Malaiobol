import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";
import { 
    ItechReq,
    TechProjectResult
}   from "../interfaces";

const assignTech = async (req: Request, resp: Response): Promise<Response> => {
    const projectId: number = +req.params.id;
    const projectData: ItechReq = req.body;
    let queryString: string = 
    `
        SELECT
            *
        FROM
            technologies
        WHERE
            "name" = $1
        ;
    `
    let queryConfig: QueryConfig = {
        text: queryString,
        values: [projectData.name]
    };
    const queryResultTech = await client.query(queryConfig); 
    if(queryResultTech.rowCount === 0){
        return resp.status(400).json({
            message: "Tech not suported, please select one of these options",
            keys: [
                "JavaScript",
                "Python",
                "React",
                "Express.js",
                "HTML",
                "CSS",
                "Django",
                "PostgreSQL",
                "MongoDB"
            ]
        })
    };
    queryString = 
    `
        UPDATE
            technologies_projects 
        SET 
   
            "projectId" = $1,
            "technologyId" = $2, 
            "addedIn" = $3
            
        RETURNING *;
    `
    const actualDate = new Date(Date.now() + 86400 * 1000);
    queryConfig ={
        text: queryString,
        values: [projectId, queryResultTech.rows[0].id, actualDate]
    };
    const queryAssignTechResult: TechProjectResult = await client.query(queryConfig);
    return resp.status(201).json(queryAssignTechResult.rows[0]);        
};

const deleteTech = async (req: Request, resp: Response): Promise<Response> =>{
    const projectId: number = +req.params.id;
    const projectName: string = req.params.name;

    const queryString = 
    `
        DELETE FROM
            technologies_projects
        WHERE
            technologies_projects."projectId" = $1
        ; 
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    };

    const queryResult: QueryResult = await client.query(queryConfig);
    return resp.status(204).json({});
};

export {
    assignTech,
    deleteTech
}