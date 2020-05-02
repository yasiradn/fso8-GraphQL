import React from 'react'
import { gql, useQuery } from '@apollo/client';

export const ALL_BOOKS = gql`
query{
  allBooks{
    title
   author
   published
 }
}
`
const Books = (props) => {
  const GET_ALL_BOOKS = useQuery(ALL_BOOKS)
  if (!props.show) {
    return null
  }

  if(!GET_ALL_BOOKS) {
    return null
  }

  const books = GET_ALL_BOOKS.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books