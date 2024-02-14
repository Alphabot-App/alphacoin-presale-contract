// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BoostPrivateSaleUpgradeable is Initializable, OwnableUpgradeable {
    IERC20 public usdt;
    IERC20 public usdc;

    event PrivateSale(address indexed sender, address indexed token, uint256 value);
    event Withdrawn(address indexed token, uint256 value, address indexed recipient);

    function initialize(
        IERC20 _usdt,
        IERC20 _usdc
    ) public initializer {
        usdt = _usdt;
        usdc = _usdc;
        __Ownable_init(
            msg.sender
        );
    }

    function privateSaleWithEth() external payable {
        require(msg.value > 0, "Non zero value");
        emit PrivateSale(msg.sender, address(0x0), msg.value);
    }

    function privateSaleWithToken(
        address token,
        uint256 amount
    ) external {
        require(token == address(usdt) || token == address(usdc), "BoostPrivateSaleUpgradeable: Invalid token");
        require(amount > 0, "BoostPrivateSaleUpgradeable: Non zero value");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        emit PrivateSale(msg.sender, token, amount);
    }

    function withdraw(
        address token,
        uint256 amount,
        address recipient        
    ) external onlyOwner {
        if(token == address(0x0)) {
            payable(recipient).transfer(amount);
        } else {
            IERC20(token).transfer(recipient, amount);
        }
        emit Withdrawn(token, amount, recipient);
    }
}
