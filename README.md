# allot

### User

#####User Registration 
    
URL: /register

METHOD: PUT

DATA PARAMS:
    
    firstName = "String"
    lastName = "String"
    email="String"
    password="String"
    
SUCCESS RESPONSE:Code: 200

    Content: { id : 12, name : "Nay Sharma", token : "abshdbjhcjhcbwhdbcjw" }

ERROR RESPONSE:

    Code: 403 FORBIDDEN
    Content: { error : "Server refused to register" }

#####User Authentication
URL: /login

METHOD: PUT

    DATA PARAMS:
    email=[String]
    password=[String]
    
SUCCESS RESPONSE:

    Code: 200
    Content: { id : 12, name : "Michael Bloom", token : "abshdbjhcjhcbwhdbcjw" }

ERROR RESPONSE:

    Code: 404 NOT FOUND
    Content: { error : "User doesn't exist" }

================================================================================

Group
#####

    Create Group
    ------------

    URL:
    /group

    METHOD:
    POST

    DATA PARAMS:
    user_id=[Integer]
    group_name=[String]
    token=[String]

    SUCCESS RESPONSE:
    Code: 200
    Content: { id : 101, group_name : "MAD", members : [12], owner_id : "12" }

    ERROR RESPONSE:
    Code: 403
    Content: { error : "Users has created too many groups" }

    ERROR RESPONSE:
    Code: 403
    Content: { error : "Server refused to get groups" }

    Code: 401 UNAUTHORIZED
    Content: { error : "You are unauthorized to make this request." }

    Get groups
    ----------

    URL:
    /group

    METHOD:
    GET

    DATA PARAMS:
    owner_id=[Integer]
    token=[String]

    SUCCESS RESPONSE:
    Code: 200
    Content: [{ id : 101, group_name : "MAD", members : [12], owner_id : "12" }]

    ERROR RESPONSE:
    Code: 403
    Content: { error : "Server refused to get groups" }

    Code: 401 UNAUTHORIZED
    Content: { error : "You are unauthorized to make this request." }

    Add member to group
    -------------------

    URL:
    /group/member

    METHOD:
    PUT

    DATA PARAMS:
    owner_id=[Integer]
    token=[String]
    group_id=[Integer]
    member_id=[Integer]

    SUCCESS RESPONSE:
    Code: 200
    Content: [{ id : 101, group_name : "MAD", members : [12, 98], owner_id : "12" }]

    ERROR RESPONSE:
    Code: 403
    Content: { error : "Server refused to add member to group" }

    Code: 401 UNAUTHORIZED
    Content: { error : "You are unauthorized to make this request." }

    Delete member from group
    ------------------------

    URL:
    /group/member

    METHOD:
    DELETE

    DATA PARAMS:
    owner_id=[Integer]
    token=[String]
    group_id=[Integer]
    member_id=[Integer]

    SUCCESS RESPONSE:
    Code: 200
    Content: [{ id : 101, group_name : "MAD", members : [12], owner_id : "12" }]

    ERROR RESPONSE:
    Code: 403
    Content: { error : "Server refused to delete member from group" }

    Code: 401 UNAUTHORIZED
    Content: { error : "You are unauthorized to make this request." }

    Leave group
    ------------------------

    URL:
    /group/leave

    METHOD:
    POST

    DATA PARAMS:
    user_id=[Integer]
    token=[String]
    group_id=[Integer]

    SUCCESS RESPONSE:
    Code: 200
    Content: { status : 1}

    ERROR RESPONSE:
    Code: 403
    Content: { error : "Server refused request to leave from group" }

    Code: 401 UNAUTHORIZED
    Content: { error : "You are unauthorized to make this request." }

================================================================================

Group
#####
