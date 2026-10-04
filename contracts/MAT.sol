// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MAT is ERC20, ERC20Permit, Ownable {
    uint8 private constant TOKEN_DECIMALS = 8;

    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10 ** TOKEN_DECIMALS;

    event TokensBurned(address indexed account, uint256 amount);
    event ERC20Recovered(address indexed token, address indexed to, uint256 amount);

    /// @notice MAT 토큰을 배포하면서 최초 발행량 전체를 지정된 지갑들에 배분한다.
    /// @dev 총발행량 100억 MAT를 생성자에서 한 번만 민팅하며, 이후 추가 민팅 함수는 존재하지 않는다.
    ///      `Ownable(adminWallet)`을 통해 관리자 권한은 `adminWallet`에 부여된다.
    ///      팀/리워드/마케팅/유동성/리저브 지갑은 0 주소를 허용하지 않으며,
    ///      모든 배분 후 실제 `totalSupply()`가 `MAX_SUPPLY`와 정확히 일치하는지 검증한다.
    /// @param adminWallet 컨트랙트 소유자 권한을 받을 관리자 지갑 주소.
    /// @param teamWallet 팀 물량 1,500,000,000 MAT를 받을 지갑 주소.
    /// @param rewardWallet 리워드 물량 4,000,000,000 MAT를 받을 지갑 주소.
    /// @param marketingWallet 마케팅 물량 1,000,000,000 MAT를 받을 지갑 주소.
    /// @param liquidityWallet 유동성 물량 2,000,000,000 MAT를 받을 지갑 주소.
    /// @param reserveWallet 리저브 물량 1,500,000,000 MAT를 받을 지갑 주소.
    constructor(
        address adminWallet,
        address teamWallet,
        address rewardWallet,
        address marketingWallet,
        address liquidityWallet,
        address reserveWallet
    ) ERC20("ManicAwardToken", "MAT") ERC20Permit("ManicAwardToken")  Ownable(adminWallet) {
        require(teamWallet != address(0), "team zero");
        require(rewardWallet != address(0), "reward zero");
        require(marketingWallet != address(0), "marketing zero");
        require(liquidityWallet != address(0), "liquidity zero");
        require(reserveWallet != address(0), "reserve zero");

        _mint(teamWallet, 1_500_000_000 * 10 ** TOKEN_DECIMALS);
        _mint(rewardWallet, 4_000_000_000 * 10 ** TOKEN_DECIMALS);
        _mint(marketingWallet, 1_000_000_000 * 10 ** TOKEN_DECIMALS);
        _mint(liquidityWallet, 2_000_000_000 * 10 ** TOKEN_DECIMALS);
        _mint(reserveWallet, 1_500_000_000 * 10 ** TOKEN_DECIMALS);

        require(totalSupply() == MAX_SUPPLY, "supply mismatch");
    }

    /// @notice MAT 토큰의 소수점 자릿수를 반환한다.
    /// @dev OpenZeppelin ERC20의 기본값 18자리를 덮어써서 8자리로 고정한다.
    ///      `pure` 함수이므로 상태를 읽거나 변경하지 않는다.
    /// @return 토큰 소수점 자릿수인 8을 반환한다.
    function decimals() public pure override returns (uint8) {
        return TOKEN_DECIMALS;
    }

    /// @notice 호출자가 보유한 자기 MAT 토큰을 직접 소각한다.
    /// @dev `_msgSender()`의 잔액에서만 소각되므로 다른 지갑의 토큰을 강제로 소각할 수 없다.
    ///      잔액보다 큰 수량을 소각하려 하면 OpenZeppelin ERC20의 `_burn` 검증에서 revert된다.
    ///      소각에 성공하면 총발행량이 해당 수량만큼 감소하고 `TokensBurned` 이벤트가 발생한다.
    /// @param amount 소각할 MAT 수량. 8자리 소수점 단위를 포함한 최소 단위 기준이다.
    function burn(uint256 amount) external {
        _burn(_msgSender(), amount);
        emit TokensBurned(_msgSender(), amount);
    }

    /// @notice 컨트랙트 주소로 잘못 전송된 ERC20 토큰을 관리자 지갑 권한으로 회수한다.
    /// @dev `onlyOwner`가 적용되어 컨트랙트 소유자만 호출할 수 있다.
    ///      수신 주소는 0 주소일 수 없고, 대상 ERC20의 `transfer`가 `true`를 반환해야 성공한다.
    ///      이 함수는 외부 ERC20 회수용이며 MAT의 추가 민팅, 강제 소각, 일시정지, 블랙리스트 기능을 제공하지 않는다.
    /// @param token 회수할 ERC20 토큰 컨트랙트 주소.
    /// @param to 회수한 토큰을 받을 지갑 주소.
    /// @param amount 회수할 ERC20 토큰 수량.
    function recoverERC20(IERC20 token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "zero address");
        require(token.transfer(to, amount), "transfer failed");

        emit ERC20Recovered(address(token), to, amount);
    }
}
