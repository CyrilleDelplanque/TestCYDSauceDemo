Feature: Login page Functionality

    @testLoginUserError
    Scenario: Verify Login of User Error Case
        Given I am on saucedemo website
        When I try to Login with my <Name> and <Password>
        Then A Error message <ErrorMessage> is displayed over a Red frame

    Examples:     
    | Name                          | Password    | ErrorMessage                                                             | 
    | ""                            | ""          | "Epic sadface: Username is required"                                       |
    | "Test"                        | ""          | "Epic sadface: Password is required"                                     |
    | "Bad"                         | "Bad"       | "Epic sadface: Username and password do not match any user in this service" |
    | "locked_out_user"             | "secret_sauce" | "Epic sadface: Sorry, this user has been locked out."                    |

    @testLoginNormalCase
    Scenario: Verify Login of User Normal Case
        Given I am on saucedemo website
        When I try to Login as <User>
        Then I am logged as <User>

     Examples:     
    | User      |                                          
    | "Martine" | 
    | "Pierre"  | 
    | "Paul"    | 
    | "Cyrille" | 
    | "Lolita"  | 

    @testLogout
    Scenario: Verify Logout
        Given I am on saucedemo website
        And I am connected as <User>
        When I logout
        Then I am back to Login Page

     Examples:     
    | User      |                                          
    | "Martine" | 
    | "Pierre"  | 
    | "Paul"    | 
    | "Cyrille" | 
    | "Lolita"  | 

