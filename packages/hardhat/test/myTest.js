//
// this script executes when you run 'yarn test'
//
// you can also test remote submissions like:
// CONTRACT_ADDRESS=0x43Ab1FCd430C1f20270C2470f857f7a006117bbb yarn test --network rinkeby
//
// you can even run mint commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//

const hre = require("hardhat");
const { ethers } = hre;
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("🚩 Challenge 3: 🏵 Minimum Viable Dex 🤖", function () {

  this.timeout(125000);

  let balloons;



  if(process.env.CONTRACT_ADDRESS){
    // live contracts, token already deployed
  }else{
    it("Should deploy Balloon Token", async function () {
      const Balloons = await ethers.getContractFactory("Balloons");
      balloons = await Balloons.deploy();
    });
    describe("totalSupply()", function () {

      it("Should have a total supply of at least 1000", async function () {

        const totalSupply = await balloons.totalSupply();
        const totalSupplyInt = parseInt(ethers.utils.formatEther(totalSupply))
        console.log('\t'," 🧾 Total Supply:",totalSupplyInt)
        expect(totalSupplyInt).to.greaterThan(999);
      });
    })

  }


  let dex;

  if(process.env.CONTRACT_ADDRESS){
    it("Should connect to external contract", async function () {
      dex = await ethers.getContractAt("DEX",process.env.CONTRACT_ADDRESS);
      console.log(`\t`,"🛰 Connected to:",dex.address)

      console.log(`\t`,"📡 Loading the Balloons address from the Dex...")
      let tokenAddress = await dex.token();
      console.log('\t',"🏷 Token Address:",tokenAddress)

      balloons = await ethers.getContractAt("Balloons",tokenAddress);
      console.log(`\t`,"🛰 Connected to Balloons at:",balloonsToken.address)
    });
  }else{
    it("Should deploy DEX", async function () {
      const Dex = await ethers.getContractFactory("DEX");
      console.log(balloons.address);
      dex = await Dex.deploy(balloons.address);
    });
    describe("totalSupply()", function () {

      it("Should have a total supply of at least 1000", async function () {

        const totalSupply = await balloons.totalSupply();
        const totalSupplyInt = parseInt(ethers.utils.formatEther(totalSupply))
        console.log('\t'," 🧾 Total Supply:",totalSupplyInt)
        expect(totalSupplyInt).to.greaterThan(999);

      });
    })

  }

  describe("💵 ethToToken()", function () {
    it("Should let us buy tokens and our balance should go up...", async function () {
      const [ owner ] = await ethers.getSigners();
      console.log('\t'," 🧑‍🏫 Tester Address: ",owner.address)

      const startingBalance = await balloons.balanceOf(owner.address)
      console.log('\t'," ⚖️ Starting balance: ",ethers.utils.formatEther(startingBalance))

      console.log('\t'," 💸 Swapping...")
      const ethToTokensResult = await dex.ethToToken({value: ethers.utils.parseEther("0.001")});
      console.log('\t'," 🏷  ethToTokens Result: ",ethToTokensResult.hash)

      const ethReserve = await dex.balance;
      const price = await dex.price(ethers.utils.parseEther("0.001"), ethReserve-(1*10**15), balloons.balanceOf(dex.address));

      console.log('\t'," ⏳ Waiting for confirmation...")
      const txResult =  await ethToTokensResult.wait()
      expect(txResult.status).to.equal(price);

      const newBalance = await balloons.balanceOf(owner.address)
      console.log('\t'," 🔎 New balance: ", ethers.utils.formatEther(newBalance))
      expect(newBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.1")));

    });
  })


  describe("💵 tokenToEth()", function () {
    it("Should let us sell tokens and we should get eth back...", async function () {
      const [ owner ] = await ethers.getSigners();

      const startingETHBalance = await ethers.provider.getBalance(owner.address)
      console.log('\t'," ⚖️ Starting ETH balance: ",ethers.utils.formatEther(startingETHBalance))

      const startingBalance = await balloons.balanceOf(owner.address)
      console.log('\t'," ⚖️ Starting balance: ",ethers.utils.formatEther(startingBalance))

      console.log('\t'," 🙄 Approving...")
      const approveTokensResult = await balloons.approve(dex.address, ethers.utils.parseEther("0.1"));
      console.log('\t'," 🏷  approveTokens Result: ",approveTokensResult.hash)

      console.log('\t'," ⏳ Waiting for confirmation...")
      const atxResult =  await approveTokensResult.wait()
      expect(atxResult.status).to.equal(1);

      console.log('\t'," 🍾 Swapping...")
      const tokensToEthResult = await dex.tokenToEth(ethers.utils.parseEther("0.1"));
      console.log('\t'," 🏷  tokensToEth Result: ",tokenToEth.hash)

      console.log('\t'," ⏳ Waiting for confirmation...")
      const txResult =  await tokensToEthResult.wait()
      expect(txResult.status).to.equal(1);

      const newBalance = await balloons.balanceOf(owner.address)
      console.log('\t'," 🔎 New balance: ", ethers.utils.formatEther(newBalance))
      expect(newBalance).to.equal(startingBalance.sub(ethers.utils.parseEther("0.1")));

      const newETHBalance = await ethers.provider.getBalance(owner.address)
      console.log('\t'," 🔎 New ETH balance: ", ethers.utils.formatEther(newETHBalance))
      const ethChange = newETHBalance.sub(startingETHBalance).toNumber()
      expect(ethChange).to.greaterThan(100000000000000);

    });
  })







  //console.log("hre:",Object.keys(hre)) // <-- you can access the hardhat runtime env here
  /*
  describe("Staker", function () {

    if(process.env.CONTRACT_ADDRESS){
      it("Should connect to external contract", async function () {
        stakerContract = await ethers.getContractAt("Staker",process.env.CONTRACT_ADDRESS);
        console.log("     🛰 Connected to external contract",myContract.address)
      });
    }else{
      it("Should deploy ExampleExternalContract", async function () {
        const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
        exampleExternalContract = await ExampleExternalContract.deploy();
      });
      it("Should deploy Staker", async function () {
        const Staker = await ethers.getContractFactory("Staker");
        stakerContract = await Staker.deploy(exampleExternalContract.address);
      });
    }

    describe("mintItem()", function () {
      it("Balance should go up when you stake()", async function () {
        const [ owner ] = await ethers.getSigners();

        console.log('\t'," 🧑‍🏫 Tester Address: ",owner.address)

        const startingBalance = await stakerContract.balances(owner.address)
        console.log('\t'," ⚖️ Starting balance: ",startingBalance.toNumber())

        console.log('\t'," 🔨 Staking...")
        const stakeResult = await stakerContract.stake({value: ethers.utils.parseEther("0.001")});
        console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

        console.log('\t'," ⏳ Waiting for confirmation...")
        const txResult =  await stakeResult.wait()
        expect(txResult.status).to.equal(1);

        const newBalance = await stakerContract.balances(owner.address)
        console.log('\t'," 🔎 New balance: ", ethers.utils.formatEther(newBalance))
        expect(newBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.001")));

      });


      if(process.env.CONTRACT_ADDRESS){
        console.log(" 🤷 since we will run this test on a live contract this is as far as the automated tests will go...")
      }else{

        it("If enough is staked and time has passed, you should be able to complete", async function () {

          const timeLeft1 = await stakerContract.timeLeft()
          console.log('\t',"⏱ There should be some time left: ",timeLeft1.toNumber())
          expect(timeLeft1.toNumber()).to.greaterThan(0);


          console.log('\t'," 🚀 Staking a full eth!")
          const stakeResult = await stakerContract.stake({value: ethers.utils.parseEther("1")});
          console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

          console.log('\t'," ⌛️ fast forward time...")
          await network.provider.send("evm_increaseTime", [3600])
          await network.provider.send("evm_mine")

          const timeLeft2 = await stakerContract.timeLeft()
          console.log('\t',"⏱ Time should be up now: ",timeLeft2.toNumber())
          expect(timeLeft2.toNumber()).to.equal(0);

          console.log('\t'," 🎉 calling execute")
          const execResult = await stakerContract.execute();
          console.log('\t'," 🏷  execResult: ",execResult.hash)

          const result = await exampleExternalContract.completed()
          console.log('\t'," 🥁 complete: ",result)
          expect(result).to.equal(true);

        })
      }


      it("Should redeploy Staker, stake, not get enough, and withdraw", async function () {
        const [ owner, secondAccount ] = await ethers.getSigners();

        const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
        exampleExternalContract = await ExampleExternalContract.deploy();

        const Staker = await ethers.getContractFactory("Staker");
        stakerContract = await Staker.deploy(exampleExternalContract.address);

        console.log('\t'," 🔨 Staking...")
        const stakeResult = await stakerContract.stake({value: ethers.utils.parseEther("0.001")});
        console.log('\t'," 🏷  stakeResult: ",stakeResult.hash)

        console.log('\t'," ⏳ Waiting for confirmation...")
        const txResult =  await stakeResult.wait()
        expect(txResult.status).to.equal(1);

        console.log('\t'," ⌛️ fast forward time...")
        await network.provider.send("evm_increaseTime", [3600])
        await network.provider.send("evm_mine")

        console.log('\t'," 🎉 calling execute")
        const execResult = await stakerContract.execute();
        console.log('\t'," 🏷  execResult: ",execResult.hash)

        const result = await exampleExternalContract.completed()
        console.log('\t'," 🥁 complete should be false: ",result)
        expect(result).to.equal(false);


        const startingBalance = await ethers.provider.getBalance(secondAccount.address);
        //console.log("startingBalance before withdraw", ethers.utils.formatEther(startingBalance))

        console.log('\t'," 💵 calling withdraw")
        const withdrawResult = await stakerContract.withdraw(secondAccount.address);
        console.log('\t'," 🏷  withdrawResult: ",withdrawResult.hash)

        const endingBalance = await ethers.provider.getBalance(secondAccount.address);
        //console.log("endingBalance after withdraw", ethers.utils.formatEther(endingBalance))

        expect(endingBalance).to.equal(startingBalance.add(ethers.utils.parseEther("0.001")));


      });

    });
  });*/
});
