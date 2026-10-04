// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Lock {
    /// @notice 예치된 native coin을 출금할 수 있는 최초 시간을 저장한다.
    /// @dev Unix timestamp 기준이며, 생성자에서 현재 블록 시간보다 미래 값인지 검증한다.
    ///      `withdraw()`는 현재 블록 시간이 이 값 이상일 때만 실행된다.
    uint256 public unlockTime;

    /// @notice 컨트랙트에 예치된 native coin을 출금할 수 있는 소유자 주소다.
    /// @dev 생성 시점의 `msg.sender`를 payable 주소로 저장한다.
    ///      출금 함수는 이 주소와 호출자가 일치하는 경우에만 성공한다.
    address payable public owner;

    /// @notice 컨트랙트 잔액 출금이 완료되었을 때 발생하는 이벤트다.
    /// @dev 출금 금액과 출금이 실행된 블록 시간을 기록한다.
    /// @param amount owner에게 전송된 native coin 금액.
    /// @param when 출금이 실행된 시점의 block timestamp.
    event Withdrawal(uint256 amount, uint256 when);

    /// @notice 잠금 해제 시간을 지정하고 native coin을 예치하면서 컨트랙트를 배포한다.
    /// @dev `_unlockTime`은 반드시 현재 블록 시간보다 미래여야 한다.
    ///      생성자는 `payable`이므로 배포 트랜잭션에 native coin을 함께 보낼 수 있다.
    ///      배포자는 `owner`로 저장되며, 이후 `withdraw()` 호출 권한을 가진다.
    /// @param _unlockTime 예치금 출금을 허용할 Unix timestamp.
    constructor(uint256 _unlockTime) payable {
        require(block.timestamp < _unlockTime, "Unlock time should be in the future");

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    /// @notice 잠금 해제 시간이 지난 뒤 owner가 컨트랙트 전체 잔액을 출금한다.
    /// @dev 현재 블록 시간이 `unlockTime`보다 작으면 revert된다.
    ///      호출자가 `owner`가 아니면 revert된다.
    ///      출금 직전 현재 컨트랙트 잔액과 block timestamp로 `Withdrawal` 이벤트를 발생시킨다.
    ///      이후 `call{value: amount}("")`를 사용해 컨트랙트의 native coin 전체 잔액을 전송한다.
    ///      전송 실패 시 revert되어 잔액이 컨트랙트에 그대로 남는다.
    function withdraw() public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        uint256 amount = address(this).balance;

        emit Withdrawal(amount, block.timestamp);

        (bool success,) = owner.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
