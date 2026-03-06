
import React, {useEffect, useState} from "react"
import {api} from "../services/api"

export default function Exercises(){

  const [list,setList] = useState([])

  useEffect(()=>{
    api.get("/exercises").then(res=>{
      setList(res.data)
    })
  },[])

  return (
    <div>
      <h2>Exercises</h2>

      {list.map(e=>(
        <div key={e.id}>
          <b>{e.name}</b>
          <p>{e.description}</p>
        </div>
      ))}

    </div>
  )
}
