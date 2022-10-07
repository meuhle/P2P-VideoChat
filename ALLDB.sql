CREATE DATABASE Poker
GO
USE Poker
GO

CREATE LOGIN Alex WITH PASSWORD = '123pw'; 
GO

CREATE TABLE Utenti(
	Username varchar(20) PRIMARY KEY,
	Peer varchar(50) NOT NULL,
	PassBash binary(64) NOT NULL,
	Salt uniqueidentifier NULL,
	Credito int NOT NULL,
)
GO

CREATE PROCEDURE AddUser
	@pUsername NVARCHAR(20),
	@pPeer NVARCHAR(50),
	@pPassword VARCHAR(50),
	@responseMessage NVARCHAR(250) OUTPUT
AS
BEGIN
    SET NOCOUNT ON
		DECLARE @salt UNIQUEIDENTIFIER=NEWID()
    BEGIN TRY
	INSERT INTO dbo.Utenti(Username,Peer,PassBash,Salt,Credito)
		VALUES(@pUsername,@pPeer, HASHBYTES('SHA2_512', @pPassword+CAST(@salt AS NVARCHAR(36))), @salt,0)
		SET @responseMessage='Success'
	END TRY
    BEGIN CATCH
        SET @responseMessage=ERROR_MESSAGE() 
    END CATCH
END
GO

CREATE PROCEDURE Login   /*ad ogni login aggiorno id peer*/
	@pUsername NVARCHAR(20),
	@pPassword NVARCHAR(50),
	@pPeer NVARCHAR(50),
	@responseMessage INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON
    DECLARE @userID NVARCHAR(9)
	IF EXISTS (SELECT TOP 1 Username FROM [dbo].Utenti WHERE Username=@pUsername)
	BEGIN
        SET @userID=(SELECT Username FROM [dbo].Utenti WHERE Username=@pUsername AND PassBash=HASHBYTES('SHA2_512', @pPassword+CAST(Salt AS NVARCHAR(36))))
       IF(@userID IS NULL)
           SET @responseMessage=3/*'Incorrect password'*/
       ELSE
		   UPDATE Utenti SET Peer = @pPeer WHERE Username=@pUsername	
           SET @responseMessage=1/*'User successfully logged in'*/
    END
    ELSE
       SET @responseMessage=2 /*'Invalid login'*/
END
GO


CREATE PROCEDURE AlterConto
	@pUsername NVARCHAR(20),
	@pModifica INT,
	@responseMessage NVARCHAR(250) OUTPUT
AS
BEGIN
    SET NOCOUNT ON    
    BEGIN TRY
		DECLARE @pCredito INT
		Set @pCredito = 0
		DECLARE @pNewval INT
		Set @pNewval = 0
		SET @pCredito =(SELECT Credito FROM Utenti WHERE Username=@pUsername)
		DECLARE @popposite INT
		SET @popposite = @pModifica*-1
		IF @pModifica<0 AND @pCredito>=@popposite
		BEGIN
			SET @pNewval = @pCredito +@pModifica
			UPDATE Utenti
			SET Credito = @pNewval
			WHERE Username=@pUsername
			SET @responseMessage='Success';
		END
		IF @pModifica>0
		BEGIN
			SET @pNewval = @pCredito +@pModifica
			UPDATE Utenti
			SET Credito = @pNewval
			WHERE Username=@pUsername
			SET @responseMessage='Success';
		END
		IF @pModifica<0 AND @pCredito<@popposite
		BEGIN
			UPDATE Utenti
			SET Credito = @pCredito
			WHERE Username=@pUsername
			SET @responseMessage='Credito Insufficente';
		END
		
	END TRY
    BEGIN CATCH
        SET @responseMessage=ERROR_MESSAGE() 
    END CATCH
END
GO


CREATE PROCEDURE GetCredito
	@pUsername NVARCHAR(20),
	@pCredito INT OUTPUT,
	@responseMessage NVARCHAR(250) OUTPUT
	AS
BEGIN
    SET NOCOUNT ON    
	SET @pCredito = (SELECT Credito FROM Utenti WHERE Username=@pUsername)
	IF(@pCredito IS NULL)
		SET @pCredito=0
END
GO




DECLARE @responseMessage NVARCHAR(250)
EXEC dbo.AddUser
@pUsername = 'AAAAA',
@pPassword = 'Passowrd1',
@pPeer = 'aaaaabbbbb',
@responseMessage =@responseMessage OUTPUT
SELECT @responseMessage

Select * from Utenti


DECLARE @responseMessage NVARCHAR(250)
EXEC dbo.Login
@pUsername = 'AAAAA',
@pPassword = 'Passowrd1',
@pPeer = 'bbbbbbcccccc',
@responseMessage =@responseMessage OUTPUT
SELECT @responseMessage


DECLARE @responseMessage NVARCHAR(250)
EXEC dbo.AlterConto
@pUsername = 'AAAAA',
@pModifica = -500,
@responseMessage =@responseMessage OUTPUT
SELECT @responseMessage

Select * from Utenti

DECLARE @responseMessage NVARCHAR(250)
DECLARE @pCredito INT 
EXEC dbo.GetCredito
@pUsername = 'AAAAA',
@pCredito =@pCredito OUTPUT,
@responseMessage =@responseMessage OUTPUT
SELECT @pCredito