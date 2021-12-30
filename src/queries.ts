export const editProfileQuery = (email) => `
           mutation{
            editProfile(email:"${email}"){
              ok
              error
            }
          }
       `;

export const LoginQuery = (email, password) => ` 
          mutation{
            login(email:"${email}", password:"${password}"){
              ok
              token
              error
            }
          }
      `;
export function createAccountQuery(email: string, password: string) {
  return `
          mutation{
            createAccount(email:"${email}", password:"${password}", role:Owner){
              ok
              error
            }
          }`;
}
export const seeProfileQuery = (userId) => `
        query{
          seeProfile(userId:${userId}){
            ok
            error
            user{
              id
            }
          }
        }
      `;

export const MeQuery = () =>
  `
          query{
            Me{
              email
            }
          }
          `;
export const VerifyEmailQuery = (code: string) => `
   mutation{
    verifyEmail(code:"${code}"){
      ok
      error
    }
  }`;
