  
import React, { useState } from 'react'
import { gql, useMutation, useQuery, from } from '@apollo/client';
import Select from 'react-select'

const ALL_AUTHORS = gql`
query{
 allAuthors{
  name
  born
  bookCount
 }
}
`
const UPDATE_AUTHOR = gql `
mutation editAuthor($getName: String!, $byearInt: Int!) {
  editAuthor(name: $getName, setBornTo: $byearInt)  {
   name
   born
}
}
`
const Authors = (props) => {
  const result_allAuthors = useQuery(ALL_AUTHORS)
  const [name, setName] = useState('')
  const [byear, setByear] = useState('')
  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS } ]
  })
  if (!props.show) {
    return null
  }

  if(!result_allAuthors) {
    return null
  }
  
  if (result_allAuthors.loading)  {
    return <div>loading...</div>
  }
  let authors = result_allAuthors.data.allAuthors
  const option_del = authors.map(op=>({label:op.name, value:op.name}))

  const updateData = async (event) => {
    event.preventDefault()
    const byearInt = parseInt(byear)
    const getName = name.value
    updateAuthor({variables:{getName,byearInt}})
    setName('')
    setByear('')
  }
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        <form onSubmit={updateData}>
        <Select value={name} options={option_del} onChange={(name) => setName(name)}/>
        <div>
        birthyear <input
            value={byear}
            type='number'
            onChange={({ target }) => setByear(target.value)}
          />
        </div>
           <button type='submit'>update year</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
